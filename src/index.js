const express = require('express'); 
const pool = require('./db');       
const app = express();              
app.use(express.json()); 
const bcrypt = require('bcrypt');

const port = process.env.PORT || 3000; 

// --- ROUTES ---

// Door 1: Home
app.get('/', (req, res) => {
  res.send('Welcome to the Service Marketplace API!');
});

// Door 2: Users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Door 3: Jobs (Now properly closed!)
app.get('/jobs', async (req, res) => {
  try {
    const sqlQuery = `
      SELECT jobs.*, users.full_name 
      FROM jobs 
      JOIN users ON jobs.client_id = users.id
    `;
    const result = await pool.query(sqlQuery);
    res.json(result.rows);
  } catch (err) {
    console.error('DATABASE ERROR:', err.message); 
    res.status(500).send('Server Error');
  }
});

// Door 4: Register users 
app.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role, city } = req.body;

    // 1. Generate a salt and hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Insert the HASHED password into the database
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, city) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email',
      [full_name, email, hashedPassword, role, city]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Registration failed');
  }
});
// Door 5 : Post jobs
app.post('/jobs', async (req, res) => {
  try {
    // 1. Get job details from Postman
    const { client_id, title, description, car_model, pickup_address, job_date, price } = req.body;

    // 2. Insert into the jobs table
    const newJob = await pool.query(
      'INSERT INTO jobs (client_id, title, description, car_model, pickup_address, job_date, price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [client_id, title, description, car_model, pickup_address , job_date, price]
    );

    res.status(201).json(newJob.rows[0]);
  } catch (err) {
    console.error('Job Creation Error:', err.message);
    res.status(500).send('Could not create job');
  }
});

// Door 6: Delete a Job
app.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params; // Grabs the ID from the URL

    const deleteJob = await pool.query(
      'DELETE FROM jobs WHERE id = $1 RETURNING *',
      [id]
    );

    // If the database didn't find that ID, tell the user
    if (deleteJob.rows.length === 0) {
      return res.status(404).send('Job not found');
    }

    res.json({ message: 'Job was deleted!', deletedJob: deleteJob.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Door 7: Update
app.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const fields = req.body; // This is the 'package' from Postman

    // 1. We build the SQL string dynamically based on what you sent
    const keys = Object.keys(fields);
    if (keys.length === 0) {
      return res.status(400).send('Nothing to update');
    }

    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    // 2. We add the ID as the very last placeholder
    const values = Object.values(fields);
    values.push(id);

    const query = `UPDATE jobs SET ${setClause} WHERE id = $${values.length} RETURNING *`;

    const updateJob = await pool.query(query, values);

    if (updateJob.rows.length === 0) {
      return res.status(404).send('Job not found');
    }

    res.json(updateJob.rows[0]); 
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});