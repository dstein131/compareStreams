const db = require('./db');

const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE video (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        views INT NOT NULL,
        likes INT NOT NULL,
        concurrent_viewers INT NOT NULL,
        live_percentage NUMERIC(5,2) NOT NULL,
        superchat_total NUMERIC(10,2) NOT NULL
      );
      
      CREATE TABLE superchats (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log('Tables created successfully!');
  } catch (err) {
    console.error(err.stack);
  } finally {
    db.end();
  }
};

createTables();
