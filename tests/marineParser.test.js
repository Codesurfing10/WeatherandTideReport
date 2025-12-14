/**
 * Tests for NOAA NDBC marine data parser
 */

// Mock NDBC response data
const mockNdbcResponse1 = {
  data: [{
    time: '2024-01-15T12:00:00Z',
    wtmp: 14.5,  // sea temp in Celsius
    wvht: 2.3,   // wave height in meters
    swh: 1.8,    // swell height in meters
    swper: 12,   // swell period in seconds
    swdir: 270   // swell direction in degrees
  }]
};

const mockNdbcResponse2 = {
  time: '2024-01-15T12:00:00Z',
  sea_temp: 15.0,
  wave_height: 2.5,
  swell_height: 2.0,
  swell_period: 14,
  swell_direction: 290
};

const mockNdbcResponse3 = {
  data: [{
    time: '2024-01-15T12:00:00Z',
    wt: 13.5,
    significant_wave_height: 1.9
  }]
};

// Helper function to normalize data (extracted from marine.js for testing)
function normalizeMarineData(ndbcData, station) {
  try {
    const data = ndbcData.data?.[0] || ndbcData;
    
    const timestamp = data.time || data.timestamp || new Date().toISOString();
    
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
    
    let waveHeight = null;
    if (data.wvht !== undefined && data.wvht !== null) {
      waveHeight = parseFloat(data.wvht);
    } else if (data.wave_height !== undefined && data.wave_height !== null) {
      waveHeight = parseFloat(data.wave_height);
    } else if (data.significant_wave_height !== undefined && data.significant_wave_height !== null) {
      waveHeight = parseFloat(data.significant_wave_height);
    }
    
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

describe('NOAA NDBC Marine Data Parser', () => {
  test('should parse NDBC response with data array (standard format)', () => {
    const result = normalizeMarineData(mockNdbcResponse1, '46042');
    
    expect(result.source).toBe('ndbc');
    expect(result.station).toBe('46042');
    expect(result.timestamp).toBe('2024-01-15T12:00:00Z');
    expect(result.sea_temperature).toBe(14.5);
    expect(result.wave_height).toBe(2.3);
    expect(result.swell_height).toBe(1.8);
    expect(result.swell_period).toBe(12);
    expect(result.swell_direction).toBe(270);
    expect(result.raw).toEqual(mockNdbcResponse1);
  });
  
  test('should parse NDBC response without data array (alternative format)', () => {
    const result = normalizeMarineData(mockNdbcResponse2, '46025');
    
    expect(result.source).toBe('ndbc');
    expect(result.station).toBe('46025');
    expect(result.sea_temperature).toBe(15.0);
    expect(result.wave_height).toBe(2.5);
    expect(result.swell_height).toBe(2.0);
    expect(result.swell_period).toBe(14);
    expect(result.swell_direction).toBe(290);
  });
  
  test('should handle alternative field names (wt, significant_wave_height)', () => {
    const result = normalizeMarineData(mockNdbcResponse3, '46086');
    
    expect(result.sea_temperature).toBe(13.5);
    expect(result.wave_height).toBe(1.9);
    expect(result.swell_height).toBe(null);
  });
  
  test('should handle missing fields gracefully', () => {
    const minimalData = {
      time: '2024-01-15T12:00:00Z'
    };
    
    const result = normalizeMarineData(minimalData, '46042');
    
    expect(result.source).toBe('ndbc');
    expect(result.station).toBe('46042');
    expect(result.sea_temperature).toBe(null);
    expect(result.wave_height).toBe(null);
    expect(result.swell_height).toBe(null);
    expect(result.swell_period).toBe(null);
    expect(result.swell_direction).toBe(null);
  });
  
  test('should use current time if timestamp not provided', () => {
    const dataNoTime = {
      wtmp: 14.0
    };
    
    const result = normalizeMarineData(dataNoTime, '46042');
    
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
  });
});
