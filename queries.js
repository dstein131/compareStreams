const db = require('./db.js');

const insertLivestreamData = (data) => {
  const queryText = 'INSERT INTO livestream_data(video_title, video_views, video_likes, video_concurrent_viewers, video_percentage) VALUES($1, $2, $3, $4, $5)';

  data.forEach(item => {
    const values = [item.title, item.views, item.likes, item.concurrentViewers, item.livePercentage];
    
    db.query(queryText, values, (err, res) => {
      if (err) {
        console.log('Error inserting data: ', err.stack);
      } else {
        console.log('Inserted data successfully: ', res.rows[0]);
      }
    });
  });
};

module.exports = insertLivestreamData;
