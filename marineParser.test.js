const { parseNdbc } = require('../server/routes/marineParser');

test('parseNdbc maps common fields', () => {
  const sample = [
    {
      station: '46042',
      time_iso8601: '2025-12-14T08:00:00Z',
      sea_temp: '12.3',
      wvht: '1.5',
      swvht: '0.8',
      dpd: '8.5',
      swdir: '120'
    }
  ];
  const out = parseNdbc(sample);
  expect(out.source).toBe('ndbc');
  expect(out.station).toBe('46042');
  expect(out.timestamp).toBe('2025-12-14T08:00:00.000Z');
  expect(out.sea_temperature).toBeCloseTo(12.3);
  expect(out.wave_height).toBeCloseTo(1.5);
  expect(out.swell_height).toBeCloseTo(0.8);
  expect(out.swell_period).toBeCloseTo(8.5);
  expect(out.swell_direction).toBeCloseTo(120);
});