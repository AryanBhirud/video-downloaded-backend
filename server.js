import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import ytdl from 'ytdl-core';

dotenv.config(); // Correct way to configure dotenv

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.post('/download', async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: 'Missing videoUrl in request body' });
    }

    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

    const filename = `${Date.now()}-${format.itag}.mp4`; // Unique filename

    // Set response headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the video directly to the response
    const videoStream = ytdl(videoUrl, { format });

    videoStream.on('error', (error) => {
      console.error('Error downloading video:', error);
      res.status(500).json({ message: 'Error downloading video' });
    });

    videoStream.pipe(res); // Stream the downloaded video directly to the response

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/download/ping', (req, res) => {
  res.status(200).send('pong');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
