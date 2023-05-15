const db = require('./db.js');

const insertLivestreamData = async (data) => {
  console.log('Input data:', data);
  const queryText = 'INSERT INTO livestream_data(video_id, video_title, video_views, video_likes, video_concurrent_viewers, total_super_chat_amount, video_percentage) VALUES($1, $2, $3, $4, $5, $6, $7)';

  for (const item of data) {
    console.log('Processing item:', item);
    console.log('Item videoId:', item.videoId);
    console.log('Item superchatTotal:', item.superchatTotal);

    const views = parseInt(item.views, 10);
    const likes = parseInt(item.likes, 10);
    const concurrentViewers = parseInt(item.concurrentViewers, 10);
    const superChatAmount = parseFloat(item.superchatTotal);
    const livePercentage = parseFloat(item.livePercentage);
    const values = [item.videoId, item.title, views, likes, concurrentViewers, superChatAmount, livePercentage];
    console.log('Prepared values:', values);

    try {
      const res = await db.query(queryText, values);
      console.log('Inserted data successfully: ', data);
    } catch (err) {
      console.log('Error inserting data: ', err.stack);
    }
  }
};

module.exports = insertLivestreamData; 