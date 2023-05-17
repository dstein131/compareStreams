const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { insertLivestreamData, getTotalSuperchatAmountByVideoId, getVideoDataByVideoId, registerUser, loginUser, getLatestTopChatUsers } = require('./queries.js');

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

app.get('/topSimps', async (req, res) => {
    const videoId = req.query.video_id;
    try {
      const topSimps = await getLatestTopChatUsers(videoId);
      res.status(200).json({ message: 'Top simps fetched successfully', data: topSimps });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to fetch top simps' });
    }
  });
  

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const success = await registerUser(username, password);
    if (success) {
      res.status(200).json({ success: true, message: 'User registered successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Error registering user' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const success = await loginUser(username, password);
    if (success) {
      res.status(200).json({ success: true, message: 'User logged in successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Error logging in user' });
  }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
