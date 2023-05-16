const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { insertLivestreamData, sendSuperchatData } = require('./queries.js');

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

app.post('/superchatData', async (req, res) => {
  const { username, amount, video_id } = req.body;
  try {
    await sendSuperchatData(username, amount, video_id);
    res.status(200).json({ message: 'Superchat data updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to update superchat data' });
  }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
