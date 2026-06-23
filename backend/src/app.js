const express    = require('express');
const cors       = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'TaskBoard API',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);

module.exports = app;