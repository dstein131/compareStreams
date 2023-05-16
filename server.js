const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { insertLivestreamData, sendSuperchatData, getTotalSuperchatAmountByVideoId, getVideoDataByVideoId } = require('./queries.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/livestreamData', async (req, res) => {
  const data = req.body;
  try {
    await insertLivestreamData(data);
    res.status(200).json({ message: 'Livestream data inserted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to insert livestream data' });
  }
});
getTotalSuperchatAmountByVideoId
app.get('/livestreamData', async (req, res) => {
    const videoId = req.query.video_id;
    try {
        const superchatData = await getVideoDataByVideoId(videoId);
        res.status(200).json({ message: 'Superchat data fetched successfully', data: superchatData });
        } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to fetch superchat data' });
        }
    });



app.get('/superchatData', async (req, res) => {
    const videoId = req.query.video_id;
    try {
      const superchatData = await getTotalSuperchatAmountByVideoId(videoId);
      res.status(200).json({ message: 'Superchat data fetched successfully', data: superchatData });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to fetch superchat data' });
    }
  });
  
  

app.listen(3000, () => console.log('Server is running on port 3000'));