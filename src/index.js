const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));