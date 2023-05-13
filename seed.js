const db = require('./db.js');

// Function to create livestream_data table
const createLivestreamTable = () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS livestream_data (
      id SERIAL PRIMARY KEY,
      video_title TEXT,
      video_views INTEGER,
      video_likes INTEGER,
      video_concurrent_viewers INTEGER,
      video_percentage FLOAT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(queryText, (err, res) => {
    if (err) {
      console.log('Error creating livestream_data table: ', err.stack);
    } else {
      console.log('Successfully created livestream_data table');
    }
  });
};

// Function to create superchat_topchat table
const createSuperChatTable = () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS superchat_topchat (
      id SERIAL PRIMARY KEY,
      video_id TEXT,
      user_name TEXT,
      message TEXT,
      amount INTEGER,
      currency TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(queryText, (err, res) => {
    if (err) {
      console.log('Error creating superchat_topchat table: ', err.stack);
    } else {
      console.log('Successfully created superchat_topchat table');
    }
  });
};

// Call the functions to create tables
createLivestreamTable();
createSuperChatTable();
