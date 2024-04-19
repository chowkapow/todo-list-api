import express, { Request, Response } from "express";
import pool from "../db";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * from todos");
    res.json(rows);
  } catch (error) {
    console.error("Error executing SQL query to get all todos: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
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

router.post("/", async (req: Request, res: Response) => {
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

export default router;
