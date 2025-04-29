// services/userClient.js
const axios = require('axios');

const USER_SERVICE_BASE_URL = "http://localhost:5000/api"; // Change port if needed

async function getUserById(userId) {
    try {
        const response = await axios.get(`${USER_SERVICE_BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error.message);
        throw new Error('User Service unavailable or User not found');
    }
}

module.exports = { getUserById };
