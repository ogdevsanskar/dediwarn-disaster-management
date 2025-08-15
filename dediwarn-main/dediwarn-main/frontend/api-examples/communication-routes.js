// Example API routes for communication services
// Place these in your backend server (Express.js)

const express = require('express');
const twilio = require('twilio');
const admin = require('firebase-admin');
const router = express.Router();

// Twilio SMS API
router.post('/api/twilio/send-sms', async (req, res) => {
  try {
    const { to, message, from, accountSid, authToken } = req.body;
    
    const client = twilio(accountSid, authToken);
    
    const smsResponse = await client.messages.create({
      body: message,
      from: from,
      to: to
    });
    
    res.json({
      success: true,
      sid: smsResponse.sid,
      status: smsResponse.status
    });
  } catch (error) {
    console.error('Twilio SMS Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Firebase Push Notification API
router.post('/api/firebase/send-notification', async (req, res) => {
  try {
    const { token, notification, data } = req.body;
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: '/disaster-icon.png'
      },
      data: data || {},
      token: token,
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/disaster-icon.png',
          badge: '/disaster-badge.png',
          actions: [
            {
              action: 'view',
              title: 'View Details'
            },
            {
              action: 'emergency',
              title: 'Call Emergency'
            }
          ],
          requireInteraction: true,
          vibrate: [200, 100, 200]
        }
      }
    };
    
    const response = await admin.messaging().send(message);
    
    res.json({
      success: true,
      messageId: response
    });
  } catch (error) {
    console.error('FCM Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
