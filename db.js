const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  database: 'superchats',
  host: 'localhost',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('connection error', err.stack);
  } else {
    console.log('connected');
  }
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  end: () => {
    return pool.end();
  }
};
