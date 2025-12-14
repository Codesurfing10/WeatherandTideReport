/**
 * Express server for Weather and Tide Report
 * Provides API endpoints for marine data while serving static files
 */

const express = require('express');
const path = require('path');
const marineRouter = require('./routes/marine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes
app.use('/api/marine', marineRouter);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/marine/:station`);
});
