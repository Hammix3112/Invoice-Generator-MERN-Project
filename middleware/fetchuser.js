const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Hammadisagoodb$oy';

const fetchuser = (req, res, next) => {
    // Get token from the 'auth-token' header
    const token = req.header('auth-token');
    if (!token) {
      return res.status(401).send({ error: 'Please authenticate using a valid token' });
    }
    

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;  // Attach user data to request object
        next();  // Proceed to next middleware / route handler
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = fetchuser;
