/**
 * marineParser.js
 * Normalizes NOAA NDBC buoy observation JSON to a standard schema
 */

/**
 * Safely parse a float value, returning null if invalid
 * @param {*} value - Value to parse
 * @returns {number|null} Parsed float or null
 */
function safeParseFloat(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Safely parse a date string to ISO format
 * @param {*} dateValue - Date value to parse
 * @returns {string|null} ISO date string or null
 */
function safeParseDateISO(dateValue) {
  if (!dateValue) {
    return null;
  }
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch (e) {
    return null;
  }
}

/**
 * Parse and normalize NOAA NDBC JSON response
 * @param {Object} ndbcData - Raw NOAA NDBC JSON response
 * @param {String} station - Station ID
 * @returns {Object} Normalized marine data
 */
function parseMarineData(ndbcData, station) {
  if (!ndbcData || typeof ndbcData !== 'object') {
    throw new Error('Invalid NDBC data');
  }

  // Extract timestamp - try multiple possible fields
  let timestamp = null;
  timestamp = safeParseDateISO(ndbcData.time) 
    || safeParseDateISO(ndbcData.timestamp) 
    || safeParseDateISO(ndbcData.observation_time)
    || new Date().toISOString();

  // Extract sea temperature - try multiple possible field names
  const seaTemperature = safeParseFloat(ndbcData.sea_temp)
    || safeParseFloat(ndbcData.wt)
    || safeParseFloat(ndbcData.water_temp)
    || safeParseFloat(ndbcData.wtmp);

  // Extract wave height
  const waveHeight = safeParseFloat(ndbcData.wave_height)
    || safeParseFloat(ndbcData.significant_wave_height)
    || safeParseFloat(ndbcData.wvht);

  // Extract swell data
  const swellHeight = safeParseFloat(ndbcData.swell_height)
    || safeParseFloat(ndbcData.swh);

  const swellPeriod = safeParseFloat(ndbcData.swell_period)
    || safeParseFloat(ndbcData.swper)
    || safeParseFloat(ndbcData.dpd);

  const swellDirection = safeParseFloat(ndbcData.swell_direction)
    || safeParseFloat(ndbcData.swdir)
    || safeParseFloat(ndbcData.mwd);

  return {
    source: 'ndbc',
    station: station,
    timestamp: timestamp,
    sea_temperature: seaTemperature,
    wave_height: waveHeight,
    swell_height: swellHeight,
    swell_period: swellPeriod,
    swell_direction: swellDirection,
    raw: ndbcData
  };
}

module.exports = { 
  parseMarineData,
  safeParseFloat,
  safeParseDateISO
};
