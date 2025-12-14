/**
 * Tests for NDBC marine data parser
 */

const { normalizeNDBCData } = require('../server/utils/marineParser');

describe('normalizeNDBCData', () => {
  test('should normalize NDBC data with all fields present', () => {
    const sampleNDBCData = {
      time: '2025-12-14T20:00:00Z',
      sea_temp: 15.5,
      wave_height: 2.3,
      swell_height: 1.8,
      swell_period: 12,
      swell_direction: 270
    };

    const result = normalizeNDBCData(sampleNDBCData, '46042');

    expect(result).toEqual({
      source: 'ndbc',
      station: '46042',
      timestamp: '2025-12-14T20:00:00.000Z',
      sea_temperature: 15.5,
      wave_height: 2.3,
      swell_height: 1.8,
      swell_period: 12,
      swell_direction: 270,
      raw: sampleNDBCData
    });
  });

  test('should handle alternative field names (wt, wvht, etc.)', () => {
    const sampleNDBCData = {
      timestamp: '2025-12-14T18:30:00Z',
      wt: 14.2,
      wvht: 1.5,
      dpd: 10,
      mwd: 180
    };

    const result = normalizeNDBCData(sampleNDBCData, '46042');

    expect(result.source).toBe('ndbc');
    expect(result.station).toBe('46042');
    expect(result.sea_temperature).toBe(14.2);
    expect(result.wave_height).toBe(1.5);
    expect(result.swell_period).toBe(10);
    expect(result.swell_direction).toBe(180);
  });

  test('should handle missing optional fields', () => {
    const sampleNDBCData = {
      time: '2025-12-14T15:00:00Z',
      wt: 16.0
    };

    const result = normalizeNDBCData(sampleNDBCData, '46042');

    expect(result.source).toBe('ndbc');
    expect(result.station).toBe('46042');
    expect(result.sea_temperature).toBe(16.0);
    expect(result.wave_height).toBeNull();
    expect(result.swell_height).toBeNull();
    expect(result.swell_period).toBeNull();
    expect(result.swell_direction).toBeNull();
  });

  test('should handle data with water_temp field name', () => {
    const sampleNDBCData = {
      time: '2025-12-14T12:00:00Z',
      water_temp: 13.8,
      significant_wave_height: 2.1
    };

    const result = normalizeNDBCData(sampleNDBCData, '46042');

    expect(result.sea_temperature).toBe(13.8);
    expect(result.wave_height).toBe(2.1);
  });

  test('should use current time if no timestamp provided', () => {
    const sampleNDBCData = {
      wt: 15.0
    };

    const beforeTime = new Date();
    const result = normalizeNDBCData(sampleNDBCData, '46042');
    const afterTime = new Date();

    const resultTime = new Date(result.timestamp);
    expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  test('should throw error for invalid data', () => {
    expect(() => {
      normalizeNDBCData(null, '46042');
    }).toThrow('Invalid NDBC data');

    expect(() => {
      normalizeNDBCData('not an object', '46042');
    }).toThrow('Invalid NDBC data');
  });

  test('should handle wtmp field name for sea temperature', () => {
    const sampleNDBCData = {
      time: '2025-12-14T10:00:00Z',
      wtmp: 17.5
    };

    const result = normalizeNDBCData(sampleNDBCData, '46042');

    expect(result.sea_temperature).toBe(17.5);
  });

  test('should preserve raw NDBC data', () => {
    const sampleNDBCData = {
      time: '2025-12-14T20:00:00Z',
      wt: 15.5,
      extra_field: 'extra_value',
      another_field: 123
    };

    const result = normalizeNDBCData(sampleNDBCData, '46042');

    expect(result.raw).toEqual(sampleNDBCData);
    expect(result.raw.extra_field).toBe('extra_value');
    expect(result.raw.another_field).toBe(123);
  });
});
