const db = require('./db.js');

async function createTables() {
  try {
    // Connect to the database
    await db.connect();

    // Create the livestreams table
    const createLivestreamsTableQuery = `
    CREATE TABLE IF NOT EXISTS livestreams (
      id SERIAL PRIMARY KEY,
      video_id VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      views INTEGER DEFAULT 0,
      live_viewers INTEGER DEFAULT 0,
      total_likes INTEGER DEFAULT 0
    );
  `;
    await db.query(createLivestreamsTableQuery);

    // Create the superchats table
    const createSuperchatsTableQuery = `
      CREATE TABLE IF NOT EXISTS superchats (
        id SERIAL PRIMARY KEY,
        livestream_id INTEGER REFERENCES livestreams(id),
        superchat_id VARCHAR(255) UNIQUE NOT NULL,
        video_id VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL
      );
    `;
    await db.query(createSuperchatsTableQuery);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

createTables();
