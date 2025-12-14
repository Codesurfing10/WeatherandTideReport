# WeatherandTideReport

Solana Beach weather, tides, and marine conditions dashboard. Displays current weather, tide predictions, swell data, and NOAA buoy observations.

## Features

- **Weather Forecast**: 7-day weather forecast from Open-Meteo
- **Tide Predictions**: High/low tide data from NOAA
- **Marine Conditions**: Swell, waves, and water temperature
- **NOAA Buoy Data**: Real-time observations from NOAA NDBC buoys

## NOAA NDBC Marine Data API

This application includes a server-side API that fetches and normalizes marine data from NOAA NDBC (National Data Buoy Center) buoys.

### API Endpoint

```
GET /api/marine/:station
```

**Parameters:**
- `station` (required): NOAA NDBC station ID (e.g., `46042`)

**Example Request:**
```bash
curl http://localhost:3000/api/marine/46042
```

**Response Format:**
```json
{
  "source": "ndbc",
  "station": "46042",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "sea_temperature": 15.5,
  "wave_height": 2.3,
  "swell_height": 1.8,
  "swell_period": 12,
  "swell_direction": 270,
  "raw": { ... }
}
```

**Fields:**
- `source`: Always "ndbc"
- `station`: Station ID
- `timestamp`: Observation time in ISO8601 format
- `sea_temperature`: Water temperature in °C (or `null`)
- `wave_height`: Significant wave height in meters (or `null`)
- `swell_height`: Swell height in meters (or `null`)
- `swell_period`: Swell period in seconds (or `null`)
- `swell_direction`: Swell direction in degrees (or `null`)
- `raw`: Full NDBC JSON response for debugging

**Response Codes:**
- `200`: Success
- `400`: Invalid station parameter
- `502`: NDBC fetch failed
- `500`: Internal server error

**Caching:**
The API includes a 5-minute in-memory cache per station to reduce load on NOAA servers.

### Finding Station IDs

To find NOAA NDBC buoy station IDs near your location:

1. Visit the [NOAA NDBC website](https://www.ndbc.noaa.gov/)
2. Use the interactive map or station listing
3. Click on a buoy to see its station ID (e.g., 46042, 46086)

**Note:** NOAA NDBC data is free and requires no API key.

### Default Station

The application defaults to station **46042** (Monterey Bay, CA), which provides:
- Sea temperature
- Wave height and period
- Swell data
- Wind speed and direction

## Installation

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm start
```

Then open your browser to `http://localhost:3000`

## Testing

Run unit tests:

```bash
npm test
```

## Data Sources

- **Weather**: [Open-Meteo API](https://open-meteo.com/) (no API key required)
- **Tides**: [NOAA CO-OPS API](https://tidesandcurrents.noaa.gov/api/)
- **Marine**: [Open-Meteo Marine API](https://marine-api.open-meteo.com/)
- **Buoy Data**: [NOAA NDBC](https://www.ndbc.noaa.gov/) (no API key required)