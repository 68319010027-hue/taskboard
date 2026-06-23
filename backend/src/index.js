import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      await pool.query('SELECT 1');
    }
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, description, status FROM tasks ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, status = 'todo' } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: 'title is required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id, title, description, status',
      [title.trim(), description?.trim() ?? '', status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { title, description, status } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'invalid id' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING id, title, description, status`,
      [title?.trim(), description?.trim(), status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'task not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'invalid id' });
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
