const jwt = require("jsonwebtoken");

// Use the secret key from the environment variable (fallback to a default key in development)
const secretKey = process.env.JWT_SECRET || '72d52ecab348b00433dd0adc4da1b1c637cd2d856b7cacfd81fb9f43d97f3169';

module.exports = (req, res, next) => {
  try {
    // Check if the token is present in the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    
    // If no token is present, return an error
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required", success: false });
    }

    // Verify the token using the secret key
    const decryptedToken = jwt.verify(token, secretKey);
    
    // Add user info to the request object
    req.userId = decryptedToken.userId;
    
    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // Return error message if token verification fails
    res.status(401).json({ message: error.message, success: false });
  }
};
