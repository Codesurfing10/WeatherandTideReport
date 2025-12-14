const express = require('express');
const fetch = global.fetch || require('node-fetch'); // Node 18+ has global fetch; otherwise node-fetch should be installed
const { parseNdbc } = require('./marineParser');

const router = express.Router();

// Simple in-memory cache with TTL
const cache = new Map(); // key -> { expires: timestamp, data }

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function setCache(key, data) {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, data });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function isValidStation(station) {
  // NDBC station IDs are usually numeric or alphanumeric (simple guard)
  return typeof station === 'string' && /^[A-Za-z0-9_-]+$/.test(station);
}

router.get('/marine/:station', async (req, res) => {
  const station = req.params.station;
  if (!isValidStation(station)) {
    return res.status(400).json({ error: 'Invalid station id' });
  }

  const cacheKey = station;
  const cached = getCache(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  const url = `https://www.ndbc.noaa.gov/data/realtime2/${encodeURIComponent(station)}.json`;

  try {
    const r = await fetch(url, { timeout: 10000 });
    if (!r.ok) {
      return res.status(502).json({ error: 'Failed to fetch data from NDBC', status: r.status });
    }
    const json = await r.json();
    const normalized = parseNdbc(json);

    // ensure station is filled
    if (!normalized.station) normalized.station = station;

    setCache(cacheKey, normalized);
    return res.json(normalized);
  } catch (err) {
    console.error('Error fetching NDBC data', err);
    return res.status(502).json({ error: 'Error fetching NDBC data', message: err.message });
  }
});

module.exports = router;