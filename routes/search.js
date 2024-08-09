const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/test', async (req, res) => {
  res.send({"Message": "Hello World"})
});

router.get('/', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        key: 'AIzaSyAnGyAlc4EJSmG5XeTarwzeBsXDFX4f92o'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
