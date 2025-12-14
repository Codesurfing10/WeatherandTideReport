/**
 * marine.js
 * API route for fetching and normalizing NOAA NDBC marine buoy data
 */

const express = require('express');
const fetch = require('node-fetch');
const { parseMarineData } = require('../utils/marineParser');

const router = express.Router();

// In-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * GET /api/marine/:station
 * Fetch and normalize NOAA NDBC buoy observations
 */
router.get('/:station', async (req, res) => {
  const station = req.params.station;

  // Validate station parameter
  if (!station || !/^[a-zA-Z0-9]+$/.test(station)) {
    return res.status(400).json({
      error: 'Invalid station parameter',
      message: 'Station ID must be alphanumeric'
    });
  }

  // Check cache
  const cacheKey = station;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for station ${station}`);
    return res.json(cached.data);
  }

  try {
    // Fetch data from NOAA NDBC realtime2 endpoint
    const ndbcUrl = `https://www.ndbc.noaa.gov/data/realtime2/${station}.json`;
    console.log(`Fetching NDBC data from: ${ndbcUrl}`);
    
    const response = await fetch(ndbcUrl);
    
    if (!response.ok) {
      console.error(`NDBC API error: ${response.status} ${response.statusText}`);
      return res.status(502).json({
        error: 'NDBC fetch failed',
        message: `Failed to fetch data from NOAA NDBC (HTTP ${response.status})`,
        station: station
      });
    }

    const ndbcData = await response.json();
    
    // Parse and normalize the data
    const normalizedData = parseMarineData(ndbcData, station);

    // Store in cache
    cache.set(cacheKey, {
      data: normalizedData,
      timestamp: Date.now()
    });

    // Clean up old cache entries (simple cleanup strategy)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    res.json(normalizedData);

  } catch (error) {
    console.error(`Error fetching marine data for station ${station}:`, error);
    
    // Distinguish between network errors and parsing errors
    if (error.message.includes('Invalid NDBC data')) {
      return res.status(502).json({
        error: 'Invalid NDBC response',
        message: 'NDBC returned invalid data format',
        station: station
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      station: station
    });
  }
});

module.exports = router;
