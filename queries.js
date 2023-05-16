const { DomainsApiRequestFactory } = require('@hubspot/api-client/lib/codegen/cms/domains/apis/DomainsApi.js');
const db = require('./db.js');

const insertLivestreamData = async (data) => {
  console.log(data)
  const queryText = 'INSERT INTO livestream_data(video_id, video_title, video_views, video_likes, video_concurrent_viewers, total_super_chat_amount, video_percentage) VALUES($1, $2, $3, $4, $5, $6, $7)';

  for (const item of data) {
    // Parse the numerical data, removing commas if necessary
    const views = parseInt(item.views.replace(/,/g, ''), 10);
    const likes = parseInt(item.likes.replace(/,/g, ''), 10);
    const concurrentViewers = parseInt(item.concurrentViewers.replace(/,/g, ''), 10);
    let superChatAmount = parseFloat(item.superchatTotal.replace(/,/g, ''));

    // Check if the total superchat amount from the API pull is zero
    if (superChatAmount === 0) {
      // Fetch the total superchat amount from the database for the video_id
      superChatAmount = await getTotalSuperchatAmountByVideoId(item.videoId);
    }

    const livePercentage = parseFloat(item.livePercentage);

    const values = [item.videoId, item.title, views, likes, concurrentViewers, superChatAmount, livePercentage];
      
    // Execute the query
    await db.query(queryText, values);
    console.log('Inserted data successfully for videoId: ', item.videoId);
  }
};


const sendSuperchatData = async (username, amount, video_id) => {
  const queryText = `
    INSERT INTO superchat_data (username, amount, video_id)
    VALUES ($1, $2, $3)
  `;
  
  const values = [username, amount, video_id];

  try {
    const res = await new Promise((resolve, reject) => {
      db.query(queryText, values, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    console.log('Successfully sent superchat data');
  } catch (err) {
    console.log('Error sending superchat data:', err.stack);
  }
};

const getSuperchatDataByVideoId = async (video_id) => {
  const queryText = `
    SELECT *
    FROM superchat_data
    WHERE video_id = $1
  `;

  const values = [video_id];

  try {
    const res = await new Promise((resolve, reject) => {
      db.query(queryText, values, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    console.log('Successfully retrieved superchat data');
    return res.rows; // Return the retrieved rows
  } catch (err) {
    console.log('Error retrieving superchat data:', err.stack);
    throw err; // Rethrow the error to be handled by the caller
  }
};

const getTotalSuperchatAmountByVideoId = async (video_id) => {
  const queryText = `
    SELECT SUM(amount) as total_amount
    FROM superchat_data
    WHERE video_id = $1
  `;

  const values = [video_id];

  try {
    const res = await new Promise((resolve, reject) => {
      db.query(queryText, values, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    console.log('Successfully retrieved total superchat amount');
    return res.rows[0].total_amount; // Return the total amount
  } catch (err) {
    console.log('Error retrieving total superchat amount:', err.stack);
    throw err; // Rethrow the error to be handled by the caller
  }
};



module.exports = {
  insertLivestreamData,
  sendSuperchatData,
  getSuperchatDataByVideoId,
  getTotalSuperchatAmountByVideoId
};