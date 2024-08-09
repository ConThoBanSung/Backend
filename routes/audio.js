const play = require('play-dl');

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const stream = await play.stream(videoId);

    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');

    stream.pipe(res);
  } catch (error) {
    res.status(500).send('Error processing audio stream');
  }
});
