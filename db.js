const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  database: 'superchats',
  host: 'localhost',
  port: 5432,
});

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
