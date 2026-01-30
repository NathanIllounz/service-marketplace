// Load environment variables from .env file
require('dotenv').config();

// Pull the Pool tool from the pg library
const { Pool } = require('pg');

// Create the connection pool (The Taxi Stand)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// The "Handshake" test
// We ask for the current time to see if the connection is alive
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    // If there is an error, log the 'stack' (the history of the error)
    console.error('Connection failed! Reason:', err.stack);
  } else {
    // 'res.rows[0]' is the first line of data
    // '.now' is the name of the column returned by SELECT NOW()
    console.log('Successfully connected! Database time is:', res.rows[0].now);
  }
});

// Export the pool so other files (like index.js) can use it
module.exports = pool;