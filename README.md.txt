```markdown
## Marine data (NOAA NDBC)

This project now includes a small server endpoint and UI to show basic marine observations (sea temperature, wave height, swell height/period/direction) from NOAA NDBC buoys.

API
- GET /api/marine/:station
  - Example: /api/marine/46042
  - Response: JSON with fields:
    - source: 'ndbc'
    - station: string
    - timestamp: ISO8601 string
    - sea_temperature: number | null (°C)
    - wave_height: number | null (m)
    - swell_height: number | null (m)
    - swell_period: number | null (s)
    - swell_direction: number | null (degrees)
    - raw: original NDBC response

No API key is required for NDBC. See https://www.ndbc.noaa.gov/ to find buoy/station IDs.

Frontend
- A React component is provided at src/components/MarineCard.jsx. It defaults to station 46042. Import and mount the component where you want marine data displayed.

Testing
- A parser unit test is provided (tests/marineParser.test.js). Run tests with your project's test runner (example: `npm test` or `yarn test`).

Notes
- The server route uses an in-memory cache with a 5-minute TTL to minimize load on NDBC.
- If you deploy to a multi-replica server environment, consider using a shared cache (Redis) or rate-limiting.
```