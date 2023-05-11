const db = require('./db');

db.query('SELECT * FROM channelname', [], (err, res) => {
  if (err) {
    console.error(err.stack);
  } else {
    console.log(res.rows);
  }
  db.end();
});

const insertVideo = async (video) => {
    const { video_id, title, views, likes, concurrent_viewers, live_percentage, superchat_total } = video;
    const query = `
      INSERT INTO video (video_id, title, views, likes, concurrent_viewers, live_percentage, superchat_total)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    try {
      await db.query(query, [video_id, title, views, likes, concurrent_viewers, live_percentage, superchat_total]);
      console.log(`Video ${video_id} inserted successfully!`);
    } catch (err) {
      console.error(err.stack);
    }
  };
  
  const insertSuperchat = async (superchat) => {
    const { video_id, user_name, message, amount, timestamp } = superchat;
    const query = `
      INSERT INTO superchats (video_id, user_name, message, amount, timestamp)
      VALUES ($1, $2, $3, $4, $5)
    `;
    try {
      await db.query(query, [video_id, user_name, message, amount, timestamp]);
      console.log(`Superchat from ${user_name} inserted successfully!`);
    } catch (err) {
      console.error(err.stack);
    }
  };
  
  const getAllVideos = async () => {
    const query = 'SELECT * FROM video';
    try {
      const res = await db.query(query);
      console.log('Fetched all videos successfully!');
      return res.rows;
    } catch (err) {
      console.error(err.stack);
    }
  };

  const getAllSuperchats = async () => {
    const query = 'SELECT * FROM superchats';
    try {
      const res = await db.query(query);
      console.log('Fetched all superchats successfully!');
      return res.rows;
    } catch (err) {
      console.error(err.stack);
    }
  };
  
  // export the functions we just created so they can be used elsewhere
    module.exports = {
        insertVideo,
        insertSuperchat,
        getAllVideos,
        getAllSuperchats
    };
    
  