/**
 * marineParser.test.js
 * Unit tests for NOAA NDBC data parser
 */

const { parseMarineData } = require('../server/utils/marineParser');

describe('parseMarineData', () => {
  test('should parse complete NDBC data with all fields', () => {
    const ndbcData = {
      time: '2024-01-15T12:00:00Z',
      wtmp: 15.5,
      wvht: 2.3,
      swh: 1.8,
      swper: 12,
      swdir: 270
    };

    const result = parseMarineData(ndbcData, '46042');

    expect(result.source).toBe('ndbc');
    expect(result.station).toBe('46042');
    expect(result.timestamp).toBe('2024-01-15T12:00:00.000Z');
    expect(result.sea_temperature).toBe(15.5);
    expect(result.wave_height).toBe(2.3);
    expect(result.swell_height).toBe(1.8);
    expect(result.swell_period).toBe(12);
    expect(result.swell_direction).toBe(270);
    expect(result.raw).toEqual(ndbcData);
  });

  test('should handle alternative field names', () => {
    const ndbcData = {
      observation_time: '2024-01-15T14:30:00Z',
      water_temp: 16.2,
      significant_wave_height: 1.9,
      dpd: 10,
      mwd: 315
    };

    const result = parseMarineData(ndbcData, '46042');

    expect(result.station).toBe('46042');
    expect(result.sea_temperature).toBe(16.2);
    expect(result.wave_height).toBe(1.9);
    expect(result.swell_period).toBe(10);
    expect(result.swell_direction).toBe(315);
  });

  test('should handle missing optional fields', () => {
    const ndbcData = {
      time: '2024-01-15T12:00:00Z',
      wtmp: 14.8
    };

    const result = parseMarineData(ndbcData, '46042');

    expect(result.station).toBe('46042');
    expect(result.sea_temperature).toBe(14.8);
    expect(result.wave_height).toBeNull();
    expect(result.swell_height).toBeNull();
    expect(result.swell_period).toBeNull();
    expect(result.swell_direction).toBeNull();
  });

  test('should use current time if no timestamp provided', () => {
    const ndbcData = {
      wtmp: 15.0
    };

    const before = new Date().toISOString();
    const result = parseMarineData(ndbcData, '46042');
    const after = new Date().toISOString();

    expect(result.timestamp).toBeDefined();
    expect(result.timestamp >= before).toBeTruthy();
    expect(result.timestamp <= after).toBeTruthy();
  });

  test('should handle sea_temp field name', () => {
    const ndbcData = {
      time: '2024-01-15T12:00:00Z',
      sea_temp: 17.3
    };

    const result = parseMarineData(ndbcData, '46042');
    expect(result.sea_temperature).toBe(17.3);
  });

  test('should handle wt field name for water temperature', () => {
    const ndbcData = {
      time: '2024-01-15T12:00:00Z',
      wt: 16.5
    };

    const result = parseMarineData(ndbcData, '46042');
    expect(result.sea_temperature).toBe(16.5);
  });

  test('should throw error for invalid data', () => {
    expect(() => parseMarineData(null, '46042')).toThrow('Invalid NDBC data');
    expect(() => parseMarineData(undefined, '46042')).toThrow('Invalid NDBC data');
    expect(() => parseMarineData('not an object', '46042')).toThrow('Invalid NDBC data');
  });

  test('should preserve raw data in response', () => {
    const ndbcData = {
      time: '2024-01-15T12:00:00Z',
      wtmp: 15.5,
      custom_field: 'test',
      another_field: 42
    };

    const result = parseMarineData(ndbcData, '46042');
    expect(result.raw).toEqual(ndbcData);
    expect(result.raw.custom_field).toBe('test');
    expect(result.raw.another_field).toBe(42);
  });
});
