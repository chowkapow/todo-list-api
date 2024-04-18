import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import pool from "./db";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.get("/todos", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * from todos");
    res.json(rows);
  } catch (error) {
    console.error("Error executing SQL query to get all todos: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/todos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * from todos WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Todo item not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error executing SQL query to get single todo: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/todos", async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const now = new Date();

    const queryText = `
      INSERT INTO todos (title, description, completed, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await pool.query(queryText, [
      title,
      description,
      false,
      now,
      now,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error executing SQL query to post todo: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT);
