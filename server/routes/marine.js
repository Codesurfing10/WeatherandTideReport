/**
 * NOAA NDBC Marine Data API Route
 * Fetches and normalizes buoy observations (sea temperature, wave height, swell data)
 */

const express = require('express');
const router = express.Router();

// Simple in-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Parse and normalize NDBC JSON response
 * @param {Object} ndbcData - Raw NDBC JSON response
 * @param {string} station - Station ID
 * @returns {Object} Normalized marine data
 */
function normalizeMarineData(ndbcData, station) {
  try {
    // NDBC JSON format typically has a 'data' array with the latest observation first
    // or direct properties at the root level
    const data = ndbcData.data?.[0] || ndbcData;
    
    // Extract timestamp - NDBC usually provides time field
    const timestamp = data.time || data.timestamp || new Date().toISOString();
    
    // Sea temperature - check multiple possible field names
    // NDBC typically provides in Celsius (wtmp, sea_temp, water_temp, wt)
    let seaTemp = null;
    if (data.wtmp !== undefined && data.wtmp !== null) {
      seaTemp = parseFloat(data.wtmp);
    } else if (data.sea_temp !== undefined && data.sea_temp !== null) {
      seaTemp = parseFloat(data.sea_temp);
    } else if (data.water_temp !== undefined && data.water_temp !== null) {
      seaTemp = parseFloat(data.water_temp);
    } else if (data.wt !== undefined && data.wt !== null) {
      seaTemp = parseFloat(data.wt);
    }
    
    // Wave height - NDBC typically in meters (wvht, wave_height, significant_wave_height)
    let waveHeight = null;
    if (data.wvht !== undefined && data.wvht !== null) {
      waveHeight = parseFloat(data.wvht);
    } else if (data.wave_height !== undefined && data.wave_height !== null) {
      waveHeight = parseFloat(data.wave_height);
    } else if (data.significant_wave_height !== undefined && data.significant_wave_height !== null) {
      waveHeight = parseFloat(data.significant_wave_height);
    }
    
    // Swell data
    let swellHeight = null;
    if (data.swh !== undefined && data.swh !== null) {
      swellHeight = parseFloat(data.swh);
    } else if (data.swell_height !== undefined && data.swell_height !== null) {
      swellHeight = parseFloat(data.swell_height);
    }
    
    let swellPeriod = null;
    if (data.swper !== undefined && data.swper !== null) {
      swellPeriod = parseFloat(data.swper);
    } else if (data.swell_period !== undefined && data.swell_period !== null) {
      swellPeriod = parseFloat(data.swell_period);
    }
    
    let swellDirection = null;
    if (data.swdir !== undefined && data.swdir !== null) {
      swellDirection = parseFloat(data.swdir);
    } else if (data.swell_direction !== undefined && data.swell_direction !== null) {
      swellDirection = parseFloat(data.swell_direction);
    }
    
    return {
      source: 'ndbc',
      station: station,
      timestamp: timestamp,
      sea_temperature: seaTemp,
      wave_height: waveHeight,
      swell_height: swellHeight,
      swell_period: swellPeriod,
      swell_direction: swellDirection,
      raw: ndbcData
    };
  } catch (error) {
    throw new Error(`Failed to normalize NDBC data: ${error.message}`);
  }
}

/**
 * GET /api/marine/:station
 * Fetch marine data for a specific NDBC station
 */
router.get('/:station', async (req, res) => {
  const station = req.params.station;
  
  // Validate station parameter (alphanumeric, typically 5 characters)
  if (!station || !/^[a-zA-Z0-9]{4,6}$/.test(station)) {
    return res.status(400).json({
      error: 'Invalid station parameter. Station ID should be 4-6 alphanumeric characters.'
    });
  }
  
  // Check cache
  const cacheKey = station.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.json(cached.data);
  }
  
  try {
    // Fetch from NOAA NDBC
    const ndbcUrl = `https://www.ndbc.noaa.gov/data/realtime2/${station}.json`;
    const response = await fetch(ndbcUrl);
    
    if (!response.ok) {
      return res.status(502).json({
        error: `Failed to fetch data from NDBC. Station ${station} may not exist or NDBC service is unavailable.`,
        status: response.status
      });
    }
    
    const ndbcData = await response.json();
    const normalizedData = normalizeMarineData(ndbcData, station);
    
    // Store in cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: normalizedData
    });
    
    res.json(normalizedData);
  } catch (error) {
    console.error(`Error fetching marine data for station ${station}:`, error);
    
    // Check if it's a network/fetch error
    if (error.message.includes('fetch')) {
      return res.status(502).json({
        error: 'Failed to connect to NDBC service',
        details: error.message
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
