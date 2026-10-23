const path = require('path');
require('dotenv').config();

module.exports = {
  // Facebook API credentials
  FB_PAGE_ID: process.env.FB_PAGE_ID || '',
  FB_PAGE_ACCESS_TOKEN: process.env.FB_PAGE_ACCESS_TOKEN || '',
  FB_GRAPH_VERSION: process.env.FB_GRAPH_VERSION || 'v21.0',

  // Simulation settings
  START_YEAR: parseInt(process.env.START_YEAR || '2026', 10),
  START_MONTH: parseInt(process.env.START_MONTH || '1', 10),
  ATTACKER_BASE_WIN_RATE: parseFloat(process.env.ATTACKER_BASE_WIN_RATE || '0.62'),
  SIZE_BONUS_FACTOR: parseFloat(process.env.SIZE_BONUS_FACTOR || '0.015'),
  MAP_THEME: (process.env.MAP_THEME || 'light').toLowerCase(),
  // Automation
  DEFAULT_INTERVAL_SECONDS: parseInt(process.env.POST_INTERVAL_SECONDS || '3600', 10),

  // File paths
  PATHS: {
    GEOJSON: path.join(__dirname, '..', 'data', 'indonesia_kabupaten.geojson'),
    GRAPH: path.join(__dirname, '..', 'data', 'graph.json'),
    STATE: path.join(__dirname, '..', 'data', 'state.json'),
    OUTPUT: path.join(__dirname, '..', 'output')
  }
};
