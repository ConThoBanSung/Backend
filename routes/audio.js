const express = require('express');
const router = express.Router();
const ytdl = require("@distube/ytdl-core");

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const info = await ytdl.getInfo(videoId); // Get video information

    // Find the best audio-only format
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    if (!format) {
      throw new Error('No suitable audio format found');
    }

    const stream = ytdl(videoId, { format: format }); // Get the audio stream

    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');

    stream.pipe(res);
  } catch (error) {
    console.error('Error fetching audio stream:', error); 
    res.status(500).send('Error processing audio stream'); 
  }
});

module.exports = router;
