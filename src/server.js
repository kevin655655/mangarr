const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const mangaRoutes = require('./routes/manga');
const libraryRoutes = require('./routes/library');
const downloadRoutes = require('./routes/downloads');
const proxyRoutes = require('./routes/proxy');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/manga', mangaRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Only start the server if this file is run directly (not required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mangarr running on port ${PORT}`);
  });
}

module.exports = app;
