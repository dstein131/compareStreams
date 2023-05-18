const db = require('./db.js');


module.exports = {
  insertLivestreamData: async (data) => {
    try {
      const { videoId, title, startTime, endTime, views, live_viewers, total_likes, superchatData } = data;
  
      // Insert the livestream data or update it if it already exists
      const livestreamQuery = `
        INSERT INTO livestreams (video_id, title, start_time, end_time, views, live_viewers, total_likes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (video_id) DO UPDATE SET
          title = excluded.title,
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          views = excluded.views,
          live_viewers = excluded.live_viewers,
          total_likes = excluded.total_likes
        RETURNING id
      `;
      const livestreamValues = [videoId, title, startTime, endTime, views, live_viewers, total_likes];
      const livestreamResult = await db.query(livestreamQuery, livestreamValues);
      const livestreamId = livestreamResult.rows[0].id;
  
      // Insert the superchat data or update it if it already exists
      const superchatQuery = `
        INSERT INTO superchats (livestream_id, superchat_id, video_id, channel_id, amount, currency)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (superchat_id) DO UPDATE SET
          livestream_id = excluded.livestream_id,
          video_id = excluded.video_id,
          channel_id = excluded.channel_id,
          amount = excluded.amount,
          currency = excluded.currency
      `;
      const superchatValues = superchatData.map((superchat) => [
        livestreamId, superchat.superchatId, superchat.videoId, superchat.channelId, superchat.amount, superchat.currency
      ]);
      await Promise.all(
        superchatValues.map((values) => db.query(superchatQuery, values))
      );
  
      console.log('Livestream and superchat data inserted or updated successfully:', data);
    } catch (error) {
      console.error('Failed to insert or update livestream and superchat data:', error);
      throw error;
    }
  }
  
  
};
