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







module.exports = {
  insertLivestreamData,
  getTotalSuperchatAmountByVideoId,
  getVideoDataByVideoId

};