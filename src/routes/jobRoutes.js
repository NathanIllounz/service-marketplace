const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const verifyToken = require('../middleware/authMiddleware'); // Import the guard

// Public: Anyone can see the jobs
router.get('/', jobController.getAllJobs);

// Protected: Only logged-in users can create or delete
router.post('/', verifyToken, jobController.createJob);
router.delete('/:id', verifyToken, jobController.deleteJob);
router.put('/:id', verifyToken, jobController.updateJob);

module.exports = router;