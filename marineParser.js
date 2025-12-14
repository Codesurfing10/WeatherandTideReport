// Normalizes NDBC realtime2 JSON into a small consistent schema.
// Exported function: parseNdbc(raw) -> { source, station, timestamp, sea_temperature, wave_height, swell_height, swell_period, swell_direction, raw }
function tryParseNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function findFirstNumeric(obj, keys) {
  for (const k of keys) {
    if (obj.hasOwnProperty(k)) {
      const val = tryParseNumber(obj[k]);
      if (val !== null) return val;
    }
  }
  return null;
}

function iso8601FromCandidate(obj) {
  // NDBC sometimes provides time strings under different keys; try a few.
  const timeKeys = ['time_iso8601', 'time', 'timestamp', 'date_time', 't'];
  for (const k of timeKeys) {
    if (obj[k]) {
      const d = new Date(obj[k]);
      if (!isNaN(d)) return d.toISOString();
    }
  }
  // fallback: try year, month, day, time components if present
  return null;
}

function parseNdbc(raw) {
  // raw is expected to be an array or object from /data/realtime2/{station}.json
  // We'll attempt to find the latest observation object.
  let latest = null;
  if (Array.isArray(raw) && raw.length > 0) {
    latest = raw[0]; // many NDBC JSON feeds put newest first
  } else if (typeof raw === 'object' && raw !== null) {
    // If keyed by timestamps or single object, try to pick a likely observation object
    // If it has "observations" or "data" arrays, use that
    if (Array.isArray(raw.observations) && raw.observations.length) latest = raw.observations[0];
    else if (Array.isArray(raw.data) && raw.data.length) latest = raw.data[0];
    else latest = raw;
  }

  if (!latest) {
    return {
      source: 'ndbc',
      station: null,
      timestamp: null,
      sea_temperature: null,
      wave_height: null,
      swell_height: null,
      swell_period: null,
      swell_direction: null,
      raw
    };
  }

  // Common NDBC keys mapping (include multiple common variants)
  const seaTempKeys = ['sea_temp', 'wt', 'water_temp', 'sst', 'seaSurfaceTemperature', 'water_temperature'];
  const waveHeightKeys = ['wave_height', 'significant_wave_height', 'wvht', 'swh', 'swvht'];
  const swellHeightKeys = ['swell_height', 'swvht', 'swellH', 'swh'];
  const swellPeriodKeys = ['swell_period', 'swlper', 'sw_per', 'swper', 'per', 'dpd', 'swellPeriod'];
  const swellDirKeys = ['swell_dir', 'swdir', 'swdir_deg', 'swellDirection', 'dir'];

  const sea_temperature = findFirstNumeric(latest, seaTempKeys);
  const wave_height = findFirstNumeric(latest, waveHeightKeys);
  const swell_height = findFirstNumeric(latest, swellHeightKeys);
  const swell_period = findFirstNumeric(latest, swellPeriodKeys);
  const swell_direction = findFirstNumeric(latest, swellDirKeys);
  const timestamp = iso8601FromCandidate(latest) || (raw && raw.meta && raw.meta.date) || null;

  // If station is included
  const station = latest.station || raw.station || (raw.meta && raw.meta.station) || null;

  return {
    source: 'ndbc',
    station,
    timestamp,
    sea_temperature,
    wave_height,
    swell_height,
    swell_period,
    swell_direction,
    raw
  };
}

module.exports = { parseNdbc };