const db = require('./db.js');

// Function to create livestream_data table
const createLivestreamTable = () => {
    const queryText = `
      CREATE TABLE IF NOT EXISTS livestream_data (
        id SERIAL PRIMARY KEY,
        video_id TEXT,
        video_title TEXT,
        video_views INTEGER,
        video_likes INTEGER,
        video_concurrent_viewers INTEGER,
        total_super_chat_amount FLOAT,
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
  
  
// Function to create superchattable table
const createSuperchatTable = () => {
    const queryText = `
      CREATE TABLE IF NOT EXISTS superchat_data (
        id SERIAL PRIMARY KEY,
        username TEXT,
        amount FLOAT,
        video_id TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  
    db.query(queryText, (err, res) => {
      if (err) {
        console.log('Error creating superchat_data table:', err.stack);
      } else {
        console.log('Successfully created superchat_data table');
      }
    });
  };
  
// Call the functions to create tables
createLivestreamTable();
createSuperchatTable();
