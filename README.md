# WeatherandTideReport

A real-time weather, tide, and marine conditions dashboard for Solana Beach, featuring data from NOAA and Open-Meteo.

## Features

- **Weather Forecast**: 7-day weather predictions with temperature, conditions, sunrise/sunset
- **Tide Predictions**: NOAA tide data for La Jolla station
- **Marine Swell Data**: Ocean conditions from Open-Meteo
- **NOAA Buoy Data**: Real-time observations from NOAA NDBC buoys including sea temperature, wave height, and swell conditions

## Installation

```bash
npm install
```

## Running the Application

Start the server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

For development:

```bash
npm run dev
```

## API Endpoints

### Marine Buoy Data

**GET** `/api/marine/:station`

Fetches real-time marine observations from NOAA NDBC buoys.

**Parameters:**
- `station` (required): NDBC buoy station ID (4-6 alphanumeric characters)

**Example:**
```bash
curl http://localhost:3000/api/marine/46042
```

**Response:**
```json
{
  "source": "ndbc",
  "station": "46042",
  "timestamp": "2025-12-14T20:00:00.000Z",
  "sea_temperature": 15.5,
  "wave_height": 2.3,
  "swell_height": 1.8,
  "swell_period": 12,
  "swell_direction": 270,
  "raw": { ... }
}
```

**Response Fields:**
- `source`: Always "ndbc"
- `station`: Buoy station ID
- `timestamp`: ISO8601 timestamp of observation
- `sea_temperature`: Sea surface temperature in °C (null if unavailable)
- `wave_height`: Significant wave height in meters (null if unavailable)
- `swell_height`: Swell height in meters (null if unavailable)
- `swell_period`: Swell period in seconds (null if unavailable)
- `swell_direction`: Swell direction in degrees (null if unavailable)
- `raw`: Full NDBC JSON response

**Status Codes:**
- `200`: Success
- `400`: Invalid station ID
- `502`: NDBC service unavailable or station not found
- `500`: Internal server error

**Caching:**
API responses are cached for 5 minutes per station to reduce load on NOAA servers.

### Finding Buoy Stations

To find NDBC buoy stations near your location:

1. Visit the [NOAA NDBC Station List](https://www.ndbc.noaa.gov/)
2. Use the interactive map or search by location
3. Note the station ID (e.g., "46042" for Monterey Bay)

**No API key required** - NOAA NDBC data is freely available.

### Default Station

The application uses station **46042** (Monterey Bay, CA) as the default buoy for demonstration purposes.

## Testing

Run the test suite:

```bash
npm test
```

Tests include validation of the NDBC data parser with various field name formats.

## Data Sources

- **Weather**: [Open-Meteo API](https://open-meteo.com/)
- **Tides**: [NOAA Tides & Currents](https://tidesandcurrents.noaa.gov/)
- **Marine Swell**: [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api)
- **Buoy Data**: [NOAA NDBC](https://www.ndbc.noaa.gov/)

## License

ISC