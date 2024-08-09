const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;

  const retryRequest = async (retries = 5, delay = 1000) => {
    try {
      // Fetch video information
      const info = await ytdl.getInfo(videoId);

      // Find the best audio-only format
      const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
      if (!format) {
        return res.status(404).send('No suitable audio format found');
      }

      // Get the audio stream
      const stream = ytdl(videoId, { format });

      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      res.setHeader('Content-Type', 'audio/mpeg');

      // Pipe the audio stream to the response
      stream.pipe(res);

      // Handle stream errors
      stream.on('error', (error) => {
        console.error('Stream error:', error.message);
        res.status(500).send('Error processing audio stream');
      });
    } catch (error) {
      if (error.statusCode === 429 && retries > 0) {
        console.warn(`Rate limit exceeded. Retrying in ${delay} ms...`);
        await new Promise(res => setTimeout(res, delay));
        return retryRequest(retries - 1, delay * 2); // Exponential backoff
      }
      console.error('Error fetching audio stream:', error.message);
      res.status(error.statusCode || 500).send('Error processing audio stream');
    }
  };

  retryRequest();
});

module.exports = router;
