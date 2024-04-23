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

    const queryText = `
      INSERT INTO todos (title, description)
      VALUES ($1, $2)
      RETURNING *
    `;

    const { rows } = await pool.query(queryText, [title, description]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error executing SQL query to post todo: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:todoId", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.params;
    const { title, description, completed } = req.body;

    const values = [];
    const placeholders = [];

    if (title !== undefined) {
      values.push(title);
      placeholders.push(`title = $${values.length}`);
    }

    if (description !== undefined) {
      values.push(description);
      placeholders.push(`description = $${values.length}`);
    }

    if (completed !== undefined) {
      values.push(completed);
      placeholders.push(`completed = $${values.length}`);
    }

    if (values.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const setClause = placeholders.join(", ");

    const queryText = `UPDATE todos SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;

    const { rows } = await pool.query(queryText, [...values, todoId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Todo item not found" });
    }

    // If the Todo item is successfully updated, return it as a response
    res.json(rows[0]);
  } catch (error) {
    console.error("Error executing SQL query to post todo: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
