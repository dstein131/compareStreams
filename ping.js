const axios = require('axios');

// Prepare some mock data to send
const mockData = {
  'hub.challenge': 'challenge',
  'hub.mode': 'subscribe',
  entry: [
    {
      changes: [
        {
          payload: {
            superchat_id: 'sc123',
            video_id: 'v123',
            channel_id: 'c123',
            amount: 50,
            currency: 'USD',
          },
        },
      ],
    },
  ],
  videoId: 'v123',
  title: 'Test Video',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  views: 100,
  liveViewers: 10,
  totalLikes: 50,
};

axios
  .post('http://localhost:3000/youtube-notifications', mockData)
  .then((res) => {
    console.log(`Status: ${res.status}`);
    console.log('Body: ', res.data);
  })
  .catch((err) => {
    console.error(err);
  });
