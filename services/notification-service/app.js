// notification-service/server.js
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(require('cors')());

// Mock endpoint for notifying restaurant
app.post('/notifications/restaurant', (req, res) => {
  console.log('📢 New notification for restaurant received:', req.body);
  res.status(200).json({ message: 'Notification sent to restaurant' });
});

// Mock endpoint for notifying customer
app.post('/notifications/customer', (req, res) => {
  console.log('📢 New notification for customer received:', req.body);
  res.status(200).json({ message: 'Notification sent to customer' });
});

app.listen(PORT, () => {
  console.log(`✅ Notification Service running on port ${PORT}`);
});
