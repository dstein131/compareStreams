const { Pool } = require('pg');

let pool;
if (process.env.DATABASE_URL) {
  // Heroku connection
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Local connection
  pool = new Pool({
    user: 'postgres',
    database: 'superchats',
    host: 'localhost',
    port: 5432,
  });
}

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  connect: () => {
    return pool.connect();
  },
  end: () => {
    return pool.end();
  }
};
