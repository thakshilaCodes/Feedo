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
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware for the gateway
const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            status: false,
            message: 'Access Denied: No token provided' 
        });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        let message = 'Invalid Token';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Malformed token';
        }
        return res.status(401).json({ status: false, message });
    }
};

// Route handlers
app.post('/auth/register', (req, res) => {
    proxy.web(req, res, { target: USER_SERVICE_URL });
});

app.post('/auth/login', (req, res) => {
    proxy.web(req, res, { target: USER_SERVICE_URL });
});

// Protected routes
app.use('/users', authenticate, (req, res) => {
    proxy.web(req, res, { target: USER_SERVICE_URL });
});

app.use('/auth/profile', authenticate, (req, res) => {
    proxy.web(req, res, { target: USER_SERVICE_URL });
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