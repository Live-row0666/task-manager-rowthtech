const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Client = require('../models/client');
const Role = require('../models/role');
const createLog = require('../utils/logs').createLog;

const verifyAdminUser = async (req, res, next) => {
  try {
    // Log user request information 
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('role', 'name');
    if (user && user.role.name === 'admin') {
      const apiEndpoint = `${req.method} ${req.originalUrl}`;
      await createLog({
        userId: user._id.toString(), // Convert ObjectId to string
        apiendpoint: apiEndpoint,
        name: user.name
      });
    }

    if (!user || !['admin', 'sub-admin', 'QA', 'Support', 'Sales', 'Marketing', 'Freelancers', 'Project Manager'].includes(user.role.name)) {
      return res.status(403).json({
        status: 403,
        message: 'Access denied. Admin, Support, QA or sub-admin role required'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in verifyUser middleware:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 401,
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 401,
        message: 'Token is not valid'
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: 'Internal server error'
      });
    }
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('role', 'name');

    if (!user || user.role.name !== 'user' || !user.isActive) {
      return res.status(403).json({
        status: 403,
        message: 'Access denied. User role required'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: 'Token is not valid'
    });
  }
};


const verifyClient = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await Client.findById(decoded.id);

    if (!client) {
      return res.status(403).json({
        status: 403,
        message: 'Access denied. Client not found'
      });
    }

    if (client.isActive === false) {
      return res.status(403).json({
        status: 403,
        message: 'Your account is inactive'
      });
    }

    req.client = client;
    next();

  } catch (error) {
    console.log("VERIFY CLIENT ERROR =>", error);

    return res.status(500).json({
      status: 500,
      message: error.message,
      stack: error.stack,
    });
  }
};

const verifyAdmin = verifyAdminUser;

module.exports = { verifyAdminUser, verifyUser, verifyAdmin, verifyClient };
