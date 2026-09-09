const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const mangaRoutes = require('./routes/manga');
const libraryRoutes = require('./routes/library');
const downloadRoutes = require('./routes/downloads');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/manga', mangaRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/downloads', downloadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mangarr running on port ${PORT}`);
});

module.exports = app;
