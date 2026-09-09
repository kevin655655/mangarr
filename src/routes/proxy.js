const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/proxy/image?url=<encoded-image-url>
 * Proxies external images to bypass CORS/referrer restrictions
 */
router.get('/image', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  let imageUrl;
  try {
    imageUrl = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL encoding' });
  }

  // Basic validation to prevent open proxy abuse
  if (!/^https?:\/\//i.test(imageUrl)) {
    return res.status(400).json({ error: 'Invalid URL scheme' });
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mangarr/0.1.0',
        'Accept': 'image/*,*/*'
      },
      maxRedirects: 5
    });

    // Forward content type if present
    const contentType = response.headers['content-type'];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Set cache headers (cache for 1 hour)
    res.setHeader('Cache-Control', 'public, max-age=3600');

    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
});

module.exports = router;
