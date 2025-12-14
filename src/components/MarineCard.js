/**
 * MarineCard Component
 * Displays NOAA NDBC buoy data (sea temperature, wave height, swell information)
 * Pure JavaScript implementation for static HTML integration
 */

class MarineCard {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.station = options.station || '46086'; // Default to San Clemente Basin buoy (closest to Solana Beach)
    this.apiBase = options.apiBase || '/api/marine';
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with id '${containerId}' not found`);
      return;
    }
    
    this.render();
    this.fetchData();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="marine-card">
        <h2>NOAA Buoy Data (Station ${this.station})</h2>
        <div id="marine-card-content" class="marine-card-content loading">
          Loading marine data...
        </div>
      </div>
    `;
  }
  
  async fetchData() {
    const contentEl = document.getElementById('marine-card-content');
    
    try {
      const response = await fetch(`${this.apiBase}/${this.station}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.renderData(data);
    } catch (error) {
      console.error('Error fetching marine data:', error);
      contentEl.classList.remove('loading');
      
      // Provide specific error messages for common issues
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the server';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout: Server took too long to respond';
      }
      
      contentEl.innerHTML = `
        <div class="error">
          <strong>⚠️ Error loading marine data</strong><br>
          ${errorMessage}<br>
          <small>Station: ${this.station}</small>
        </div>
      `;
    }
  }
  
  renderData(data) {
    const contentEl = document.getElementById('marine-card-content');
    contentEl.classList.remove('loading');
    
    // Format timestamp
    let updateTime = 'Unknown';
    if (data.timestamp) {
      try {
        updateTime = new Date(data.timestamp).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      } catch (e) {
        updateTime = data.timestamp;
      }
    }
    
    // Format sea temperature (convert C to F if present)
    const seaTempC = data.sea_temperature;
    const seaTempF = seaTempC !== null ? (seaTempC * 9/5 + 32).toFixed(1) : 'N/A';
    const seaTempDisplay = seaTempC !== null 
      ? `${seaTempF}°F (${seaTempC.toFixed(1)}°C)`
      : 'N/A';
    
    // Format wave height (convert m to ft)
    const waveHeightM = data.wave_height;
    const waveHeightFt = waveHeightM !== null ? (waveHeightM * 3.281).toFixed(1) : 'N/A';
    const waveHeightDisplay = waveHeightM !== null
      ? `${waveHeightFt} ft (${waveHeightM.toFixed(1)} m)`
      : 'N/A';
    
    // Format swell data
    const swellHeightM = data.swell_height;
    const swellHeightFt = swellHeightM !== null ? (swellHeightM * 3.281).toFixed(1) : 'N/A';
    const swellHeightDisplay = swellHeightM !== null
      ? `${swellHeightFt} ft (${swellHeightM.toFixed(1)} m)`
      : 'N/A';
    
    const swellPeriod = data.swell_period !== null ? `${data.swell_period.toFixed(0)}s` : 'N/A';
    const swellDirection = data.swell_direction !== null ? `${Math.round(data.swell_direction)}° ${this.getDirectionArrow(data.swell_direction)}` : 'N/A';
    
    contentEl.innerHTML = `
      <div class="marine-data">
        <div class="marine-item highlight">
          <strong>🌡️ Sea Temperature</strong><br>
          ${seaTempDisplay}
        </div>
        <div class="marine-item">
          <strong>🌊 Wave Height</strong><br>
          ${waveHeightDisplay}
        </div>
        <div class="marine-item">
          <strong>〰️ Swell Height</strong><br>
          ${swellHeightDisplay}
        </div>
        <div class="marine-item">
          <strong>⏱️ Swell Period</strong><br>
          ${swellPeriod}
        </div>
        <div class="marine-item">
          <strong>🧭 Swell Direction</strong><br>
          ${swellDirection}
        </div>
        <div class="marine-footer">
          <small>Updated: ${updateTime}</small><br>
          <a href="https://www.ndbc.noaa.gov/station_page.php?station=${this.station}" target="_blank" rel="noopener">
            View on NDBC →
          </a>
        </div>
      </div>
    `;
  }
  
  getDirectionArrow(deg) {
    if (deg === null || deg === undefined) return '';
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.MarineCard = MarineCard;
}
