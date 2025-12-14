/**
 * marineParser.js
 * Normalizes NOAA NDBC buoy observation JSON to a standard schema
 */

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
  if (ndbcData.time) {
    timestamp = new Date(ndbcData.time).toISOString();
  } else if (ndbcData.timestamp) {
    timestamp = new Date(ndbcData.timestamp).toISOString();
  } else if (ndbcData.observation_time) {
    timestamp = new Date(ndbcData.observation_time).toISOString();
  } else {
    timestamp = new Date().toISOString();
  }

  // Extract sea temperature - try multiple possible field names
  let seaTemperature = null;
  if (ndbcData.sea_temp !== undefined && ndbcData.sea_temp !== null) {
    seaTemperature = parseFloat(ndbcData.sea_temp);
  } else if (ndbcData.wt !== undefined && ndbcData.wt !== null) {
    seaTemperature = parseFloat(ndbcData.wt);
  } else if (ndbcData.water_temp !== undefined && ndbcData.water_temp !== null) {
    seaTemperature = parseFloat(ndbcData.water_temp);
  } else if (ndbcData.wtmp !== undefined && ndbcData.wtmp !== null) {
    seaTemperature = parseFloat(ndbcData.wtmp);
  }

  // Extract wave height
  let waveHeight = null;
  if (ndbcData.wave_height !== undefined && ndbcData.wave_height !== null) {
    waveHeight = parseFloat(ndbcData.wave_height);
  } else if (ndbcData.significant_wave_height !== undefined && ndbcData.significant_wave_height !== null) {
    waveHeight = parseFloat(ndbcData.significant_wave_height);
  } else if (ndbcData.wvht !== undefined && ndbcData.wvht !== null) {
    waveHeight = parseFloat(ndbcData.wvht);
  }

  // Extract swell data
  let swellHeight = null;
  if (ndbcData.swell_height !== undefined && ndbcData.swell_height !== null) {
    swellHeight = parseFloat(ndbcData.swell_height);
  } else if (ndbcData.swh !== undefined && ndbcData.swh !== null) {
    swellHeight = parseFloat(ndbcData.swh);
  }

  let swellPeriod = null;
  if (ndbcData.swell_period !== undefined && ndbcData.swell_period !== null) {
    swellPeriod = parseFloat(ndbcData.swell_period);
  } else if (ndbcData.swper !== undefined && ndbcData.swper !== null) {
    swellPeriod = parseFloat(ndbcData.swper);
  } else if (ndbcData.dpd !== undefined && ndbcData.dpd !== null) {
    swellPeriod = parseFloat(ndbcData.dpd);
  }

  let swellDirection = null;
  if (ndbcData.swell_direction !== undefined && ndbcData.swell_direction !== null) {
    swellDirection = parseFloat(ndbcData.swell_direction);
  } else if (ndbcData.swdir !== undefined && ndbcData.swdir !== null) {
    swellDirection = parseFloat(ndbcData.swdir);
  } else if (ndbcData.mwd !== undefined && ndbcData.mwd !== null) {
    swellDirection = parseFloat(ndbcData.mwd);
  }

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

module.exports = { parseMarineData };
