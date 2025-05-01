const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const proxy = httpProxy.createProxyServer();

// Environment variables
const PORT = process.env.PORT || 3001;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET || 'jasonwebtoken';

app.use(cors({
  exposedHeaders: ['x-user-id', 'x-user-role']
}));

// Authentication middleware for the gateway
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
          status: false,
          message: 'Access Denied: No token provided' 
      });
  }

  const token = authHeader.split(' ')[1].trim();
  
  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      
      req.headers['x-user-id'] = decoded.id;
      req.headers['x-user-role'] = decoded.role;
      
      next();
  } catch (error) {
      console.error('Token verification failed:', error.message);
      const message = error.name === 'TokenExpiredError' ? 'Token expired' :
                     error.name === 'JsonWebTokenError' ? 'Malformed token' : 
                     'Invalid Token';
      return res.status(401).json({ status: false, message });
  }
};

app.post('/auth/login', (req, res) => {
    proxy.web(req, res, { target: USER_SERVICE_URL });
});

app.post('/auth/register', (req, res) => {
  proxy.web(req, res, { target: USER_SERVICE_URL });
});

// Protected routes
app.get('/users', authenticate, (req, res) => {
    proxy.web(req, res, { target: USER_SERVICE_URL });
});

app.put('/users/:id/approve', authenticate, (req, res) => {
  console.log(`Forwarding approve request for user ${req.params.id}`);
  console.log('Headers being forwarded:', req.headers);
  
  req.headers['x-user-id'] = req.user.id;
  req.headers['x-user-role'] = req.user.role;
  
  proxy.web(req, res, { 
    target: USER_SERVICE_URL,
    headers: {
      'x-user-id': req.user.id,
      'x-user-role': req.user.role
    }
  });
});

app.get('/auth/profile', authenticate, (req, res) => {
  console.log('Forwarding profile request to user service');
  proxy.web(req, res, { 
      target: USER_SERVICE_URL,
      headers: {
          'x-user-id': req.user.id,
          'x-user-role': req.user.role
      }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway is running' });
});

// Error handling
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ status: false, message: 'Service unavailable' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});