const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const mangaRoutes = require('./routes/manga');
const libraryRoutes = require('./routes/library');
const downloadRoutes = require('./routes/downloads');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/manga', mangaRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/downloads', downloadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.listen(PORT, () => {
  console.log(`Mangarr backend running on port ${PORT}`);
});

module.exports = app;
