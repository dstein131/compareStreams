const { DomainsApiRequestFactory } = require('@hubspot/api-client/lib/codegen/cms/domains/apis/DomainsApi.js');
const db = require('./db.js');

const insertLivestreamData = async (data) => {
  console.log(data)
  const queryText = 'INSERT INTO livestream_data(video_id, video_title, video_views, video_likes, video_concurrent_viewers, total_super_chat_amount, video_percentage, channel_name, top_chat_users) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';

  for (const item of data) {
    // Parse the numerical data, removing commas if necessary
    const views = parseInt(item.views.replace(/,/g, ''), 10);
    const likes = parseInt(item.likes.replace(/,/g, ''), 10);
    const concurrentViewers = parseInt(item.concurrentViewers.replace(/,/g, ''), 10);
    let superChatAmount = parseFloat(item.superchatTotal.replace(/,/g, ''));
    const livePercentage = parseFloat(item.livePercentage);
    const topChatUsers = JSON.stringify(item.topChatUsers); // Assuming your data object contains a field called 'topChatUsers'

    const values = [item.videoId, item.title, views, likes, concurrentViewers, superChatAmount, livePercentage, item.channelTitle, item.topSuperchatUsers];
      
    // Execute the query
    await db.query(queryText, values);
    console.log('Inserted data successfully for videoId: ', item.videoId);
  }
};



const getTotalSuperchatAmountByVideoId = async (videoId) => {
  const queryText = 'SELECT total_super_chat_amount FROM livestream_data WHERE video_id = $1 ORDER BY timestamp DESC LIMIT 1';
  const values = [videoId];

  // Execute the query using the database module
  const res = await db.query(queryText, values);

  // If the query returns no data or the total_super_chat_amount is null, return 0
  if (res.rows.length === 0 || res.rows[0].total_super_chat_amount === null) {
    return 0;
  }

  // Otherwise, return the total_super_chat_amount
  return res.rows[0].total_super_chat_amount;
};

const getVideoDataByVideoId = async (videoId) => {
  const queryText = 'SELECT * FROM livestream_data WHERE video_id = $1 ORDER BY timestamp DESC LIMIT 1';
  const values = [videoId];

  // Execute the query using the database module
  const res = await db.query(queryText, values);

  // If the query returns no data, return null
  if (res.rows.length === 0) {
    return null;
  }

  // Otherwise, return the data
  return res.rows[0];
};


const registerUser = async (username, password) => {
  const queryText = 'INSERT INTO users (username, password) VALUES ($1, $2)';
  const values = [username, password];

  try {
    await db.query(queryText, values);
    console.log('User registered successfully:', username);
    return true;
  } catch (err) {
    console.log('Error registering user:', err.stack);
    return false;
  }
};

const loginUser = async (username, password) => {
  const queryText = 'SELECT * FROM users WHERE username = $1 AND password = $2';
  const values = [username, password];

  try {
    const res = await db.query(queryText, values);
    if (res.rows.length === 1) {
      console.log('User logged in successfully:', username);
      return true;
    } else {
      console.log('Invalid username or password');
      return false;
    }
  } catch (err) {
    console.log('Error logging in user:', err.stack);
    return false;
  }
};

// Function to retrieve latest top chat users for a specific video
const getLatestTopChatUsers = (videoId) => {
  return new Promise((resolve, reject) => {
    const queryText = `
      SELECT top_chat_users
      FROM livestream_data
      WHERE video_id = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    db.query(queryText, [videoId], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows[0]);
      }
    });
  });
};

module.exports = {
  registerUser,
  loginUser,
  registerUser,
  loginUser,
  insertLivestreamData,
  getTotalSuperchatAmountByVideoId,
  getLatestTopChatUsers

};