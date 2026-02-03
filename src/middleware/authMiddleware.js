const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_super_secret_key_here"; // IMPORTANT: This must match your userController SECRET_KEY

const verifyToken = (req, res, next) => {
  // 1. Look for the 'Authorization' header in the request
  const authHeader = req.headers['authorization'];
  
  // 2. Extract the token (Usually sent as "Bearer <token>")
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided. Access Denied.' });
  }

  try {
    // 3. Verify the token using our secret key
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // 4. Attach the user's ID and Role to the 'req' object so the controller can use it
    req.user = decoded; 
    
    // 5. Success! Call next() to move to the Controller function
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or Expired Token' });
  }
};

module.exports = verifyToken;