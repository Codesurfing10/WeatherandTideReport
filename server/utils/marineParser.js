/**
 * Parser utility for NOAA NDBC marine data
 * Normalizes buoy observation data to a consistent schema
 */

/**
 * Normalize NDBC JSON response to our schema
 * @param {Object} ndbcData - Raw NDBC JSON response
 * @param {string} station - Station ID
 * @returns {Object} Normalized marine data
 */
function normalizeNDBCData(ndbcData, station) {
  if (!ndbcData || typeof ndbcData !== 'object') {
    throw new Error('Invalid NDBC data');
  }

  // Extract timestamp - NDBC provides various timestamp fields
  let timestamp = null;
  if (ndbcData.time) {
    timestamp = new Date(ndbcData.time).toISOString();
  } else if (ndbcData.timestamp) {
    timestamp = new Date(ndbcData.timestamp).toISOString();
  } else {
    timestamp = new Date().toISOString();
  }

  // Extract sea temperature - NDBC uses various field names
  let seaTemperature = null;
  if (typeof ndbcData.sea_temp === 'number') {
    seaTemperature = ndbcData.sea_temp;
  } else if (typeof ndbcData.wt === 'number') {
    seaTemperature = ndbcData.wt;
  } else if (typeof ndbcData.water_temp === 'number') {
    seaTemperature = ndbcData.water_temp;
  } else if (typeof ndbcData.wtmp === 'number') {
    seaTemperature = ndbcData.wtmp;
  }

  // Extract wave height
  let waveHeight = null;
  if (typeof ndbcData.wave_height === 'number') {
    waveHeight = ndbcData.wave_height;
  } else if (typeof ndbcData.significant_wave_height === 'number') {
    waveHeight = ndbcData.significant_wave_height;
  } else if (typeof ndbcData.wvht === 'number') {
    waveHeight = ndbcData.wvht;
  }

  // Extract swell data
  let swellHeight = null;
  let swellPeriod = null;
  let swellDirection = null;

  if (typeof ndbcData.swell_height === 'number') {
    swellHeight = ndbcData.swell_height;
  } else if (typeof ndbcData.swh === 'number') {
    swellHeight = ndbcData.swh;
  }

  if (typeof ndbcData.swell_period === 'number') {
    swellPeriod = ndbcData.swell_period;
  } else if (typeof ndbcData.swp === 'number') {
    swellPeriod = ndbcData.swp;
  } else if (typeof ndbcData.dpd === 'number') {
    swellPeriod = ndbcData.dpd;
  }

  if (typeof ndbcData.swell_direction === 'number') {
    swellDirection = ndbcData.swell_direction;
  } else if (typeof ndbcData.swd === 'number') {
    swellDirection = ndbcData.swd;
  } else if (typeof ndbcData.mwd === 'number') {
    swellDirection = ndbcData.mwd;
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

module.exports = {
  normalizeNDBCData
};
