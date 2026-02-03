const pool = require('../db');

// Show all jobs (with the client's name)
exports.getAllJobs = async (req, res) => {
  try {
    const sqlQuery = `
      SELECT jobs.*, users.full_name 
      FROM jobs 
      JOIN users ON jobs.client_id = users.id`;
    const result = await pool.query(sqlQuery);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Post a new job
exports.createJob = async (req, res) => {
  try {
    const { client_id, title, description, car_model, pickup_address, job_date, price } = req.body;
    const newJob = await pool.query(
      `INSERT INTO jobs (client_id, title, description, car_model, pickup_address, job_date, price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [client_id, title, description, car_model, pickup_address, job_date, price]
    );
    res.status(201).json(newJob.rows[0]);
  } catch (err) {
    res.status(500).send('Could not create job');
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteJob = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
    if (deleteJob.rows.length === 0) return res.status(404).send('Job not found');
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};