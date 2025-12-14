/**
 * Express server for Weather and Tide Report
 * Serves static files and API endpoints
 */

const express = require('express');
const path = require('path');
const marineRouter = require('./routes/marine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/marine', marineRouter);

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Weather and Tide Report server running on http://localhost:${PORT}`);
  console.log(`Marine API available at http://localhost:${PORT}/api/marine/:station`);
});

module.exports = app;
