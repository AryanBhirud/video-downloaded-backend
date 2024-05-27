import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
      const { videoUrl } = req.body;
  
      if (!videoUrl) {
        return res.status(400).json({ message: 'Missing videoUrl in request body' });
      }
  
      const info = await ytdl.getInfo(videoUrl);
      const format = ytdl.chooseFormat(info.formats, { filter: 'videoonly' });
  
      const filename = `${Date.now()}-${format.itag}.mp4`; // Unique filename
  
      const writeStream = await fs.open(filename, 'w'); // Open file asynchronously
  
      const videoStream = ytdl(videoUrl, { format });
  
      videoStream.on('progress', (chunkDownloaded, totalDownloaded, total) => {
        const progress = (totalDownloaded / total) * 100;
        console.log(`Download progress: ${progress.toFixed(2)}%`);
      });
  
      videoStream.pipe(writeStream); // Stream the downloaded video to the file
  
      writeStream.on('finish', async () => {
        await fs.close(writeStream); // Close the file stream
  
        // Send the downloaded video as a response (assuming the client can handle binary data)
        res.setHeader('Content-Type', 'video/mp4'); // Set appropriate content type
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const videoData = await fs.readFile(filename); // Read the downloaded video file
        res.send(videoData);
  
        // Clean up: Delete the temporary file (optional)
        await fs.unlink(filename);
      });
  
      writeStream.on('error', async (error) => {
        await fs.close(writeStream); // Close the file stream even on error
        console.error('Error downloading video:', error);
        res.status(500).json({ message: 'Error downloading video' });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
})

export default router;