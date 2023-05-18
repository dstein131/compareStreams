const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  insertLivestreamData,
  insertSuperchatData,
} = require('./queries');


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/youtube-notifications', async (req, res) => {
  const notification = req.body;

  const hubChallenge = req.query['hub.challenge'];
  const hubMode = req.query['hub.mode'];

  if (hubChallenge && hubMode === 'subscribe') {
    return res.status(200).send(hubChallenge);
  }

  // Extract livestream and superchat data from the notification
  const livestreamData = {
    videoId: notification.videoId, // adjust these field names according to the actual structure of your notifications
    title: notification.title,
    startTime: notification.startTime,
    endTime: notification.endTime,
    views: notification.views,
    live_viewers: notification.liveViewers,
    total_likes: notification.totalLikes,
  };

  const superchatData = notification.entry.map(entry => {
    const payload = entry.changes[0].payload;
    return {
      superchatId: payload.superchat_id,
      videoId: payload.video_id,
      channelId: payload.channel_id,
      amount: payload.amount,
      currency: payload.currency
    };
  });

  try {
    // Insert the livestream and superchat data
    await insertLivestreamData({
      ...livestreamData,
      superchatData,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
