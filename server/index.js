/**
 * Express server for Weather and Tide Report
 * Serves static files and provides API endpoints
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const marineRoutes = require('./routes/marine');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// API routes
app.use('/api/marine', marineRoutes);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Fallback route for SPA (if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET /api/marine/:station - Fetch NOAA NDBC marine data`);
});

module.exports = app;
