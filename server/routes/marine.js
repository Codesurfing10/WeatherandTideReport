/**
 * Marine data API route
 * Fetches and normalizes NOAA NDBC buoy observations
 */

const express = require('express');
const fetch = require('node-fetch');
const { normalizeNDBCData } = require('../utils/marineParser');

const router = express.Router();

// In-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Clean expired cache entries
 */
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * GET /api/marine/:station
 * Fetch marine data for a specific NDBC buoy station
 */
router.get('/:station', async (req, res) => {
  const station = req.params.station;

  // Validate station parameter (NDBC station IDs are typically 5 characters, alphanumeric)
  if (!station || !/^[a-zA-Z0-9]{4,6}$/.test(station)) {
    return res.status(400).json({
      error: 'Invalid station ID',
      message: 'Station ID must be 4-6 alphanumeric characters'
    });
  }

  try {
    // Demo mode: return mock data if USE_MOCK_DATA environment variable is set
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log(`Using mock data for station ${station}`);
      const mockData = {
        time: new Date().toISOString(),
        wt: 15.8,
        wvht: 2.1,
        dpd: 11,
        mwd: 285
      };
      const normalizedData = normalizeNDBCData(mockData, station);
      return res.json(normalizedData);
    }
    // Check cache first
    const cacheKey = station.toLowerCase();
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log(`Cache hit for station ${station}`);
      return res.json(cached.data);
    }

    // Fetch from NDBC API
    const ndbcUrl = `https://www.ndbc.noaa.gov/data/realtime2/${station}.json`;
    console.log(`Fetching NDBC data from: ${ndbcUrl}`);

    const response = await fetch(ndbcUrl, {
      headers: {
        'User-Agent': 'WeatherandTideReport/1.0'
      }
    });

    if (!response.ok) {
      console.error(`NDBC API error: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        return res.status(502).json({
          error: 'Station not found',
          message: `NDBC station ${station} not found or has no data available`
        });
      }

      return res.status(502).json({
        error: 'NDBC fetch failed',
        message: `Failed to fetch data from NDBC: ${response.status} ${response.statusText}`
      });
    }

    const ndbcData = await response.json();

    // Normalize the data
    const normalizedData = normalizeNDBCData(ndbcData, station);

    // Cache the result
    cache.set(cacheKey, {
      timestamp: now,
      data: normalizedData
    });

    // Clean old cache entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean on each request
      cleanCache();
    }

    res.json(normalizedData);

  } catch (error) {
    console.error(`Error fetching marine data for station ${station}:`, error);

    // Check if it's a network/fetch error
    if (error.name === 'FetchError' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return res.status(502).json({
        error: 'NDBC service unavailable',
        message: 'Could not connect to NDBC service'
      });
    }

    // Internal server error for other cases
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
