const pool = require('../db');
const bcrypt = require('bcrypt');

// 1. Register Logic
exports.registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role, city } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, city) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, city',
      [full_name, email, hashedPassword, role, city]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Registration failed');
  }
};

// 2. Update Settings Logic (The one you asked for!)
exports.updateUserSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body; // e.g., { "city": "Haifa", "full_name": "David I." }

    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).send('Nothing to update');

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fields);
    values.push(id);

    const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, full_name, email, role, city`;
    const updatedUser = await pool.query(query, values);

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Update failed');
  }
};
/// get all users

exports.getAllUsers = async (req, res) => {
  try {
    // Note: In the future, we will check if req.user.role === 'admin' here
    const result = await pool.query('SELECT id, full_name, email, role, city FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
// delet user

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};