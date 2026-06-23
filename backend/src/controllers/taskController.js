const pool = require('../db');

// GET /api/tasks?status=&priority=
const getAllTasks = async (req, res) => {
  try {
    const { status = '', priority = '' } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      where += ` AND priority = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT * FROM tasks ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'ไม่พบงานนี้' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium' } = req.body;
    if (!title) return res.status(400).json({ error: 'กรุณาระบุ title' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title.trim(), description.trim(), status, priority]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium' } = req.body;
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, status=$3, priority=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, description, status, priority, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'ไม่พบงานนี้' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM tasks WHERE id=$1 RETURNING *', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'ไม่พบงานนี้' });
    res.json({ message: 'ลบงานสำเร็จ', deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };