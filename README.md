# Weather and Tide Report

A comprehensive weather, tide, and marine conditions dashboard for Solana Beach, CA. Displays real-time data from NOAA and Open-Meteo APIs.

## Features

- **Weather Forecast**: 7-day weather forecast with temperature, conditions, sunrise/sunset times
- **Marine Conditions**: Current swell, wave height, and water temperature from Open-Meteo
- **NOAA Buoy Data**: Real-time sea temperature, wave height, and swell data from NOAA NDBC buoys
- **Tide Predictions**: 7-day tide predictions from NOAA
- **PWA Support**: Installable as a Progressive Web App for offline access

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

### Development

```bash
# Run in development mode
npm run dev
```

### Testing

```bash
# Run tests
npm test
```

## API Endpoints

### Marine Data API

**Endpoint**: `GET /api/marine/:station`

Fetches and normalizes marine data from NOAA NDBC buoys.

**Parameters**:
- `station` (required): NOAA NDBC station ID (4-6 alphanumeric characters)

**Response** (200 OK):
```json
{
  "source": "ndbc",
  "station": "46086",
  "timestamp": "2024-01-15T12:00:00Z",
  "sea_temperature": 14.5,
  "wave_height": 2.3,
  "swell_height": 1.8,
  "swell_period": 12,
  "swell_direction": 270,
  "raw": { /* full NDBC response */ }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid station parameter
- `502 Bad Gateway`: NDBC service unavailable or station not found
- `500 Internal Server Error`: Unexpected server error

**Features**:
- **Caching**: 5-minute in-memory cache to reduce NDBC API load
- **Unit Conversion**: Temperature in Celsius, wave/swell heights in meters
- **Field Mapping**: Supports multiple NDBC field name variations

### Finding NOAA NDBC Stations

To find NDBC buoy stations near your location:

1. Visit the [NOAA NDBC Interactive Map](https://www.ndbc.noaa.gov/)
2. Click on a buoy marker to view station details
3. Note the station ID (e.g., `46086`, `46042`)
4. No API key is required - NDBC data is publicly accessible

**Stations near Solana Beach, CA**:
- `46086`: San Clemente Basin (closest to Solana Beach)
- `46225`: Torrey Pines Outer
- `46232`: Point Loma South
- `46042`: Monterey Bay (Central CA)

### Customizing the Marine Data Station

To change the buoy station displayed on the homepage:

1. Open `index.html`
2. Find the `MarineCard` initialization (near the end of the file)
3. Change the `station` parameter:

```javascript
new MarineCard('marine-card-container', {
    station: 'YOUR_STATION_ID',  // Change this
    apiBase: '/api/marine'
});
```

## Data Sources

- **Weather**: [Open-Meteo API](https://open-meteo.com/) (no API key required)
- **Marine Conditions**: [Open-Meteo Marine API](https://marine-api.open-meteo.com/)
- **NOAA Buoy Data**: [NOAA NDBC](https://www.ndbc.noaa.gov/) (no API key required)
- **Tides**: [NOAA Tides and Currents API](https://tidesandcurrents.noaa.gov/api/)

## Project Structure

```
.
├── index.html              # Main application page
├── server/
│   ├── index.js           # Express server
│   └── routes/
│       └── marine.js      # NOAA NDBC API route
├── src/
│   └── components/
│       └── MarineCard.js  # Marine data display component
├── tests/
│   └── marineParser.test.js  # Marine data parser tests
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker for offline support
└── package.json           # Project dependencies
```

## License

MIT