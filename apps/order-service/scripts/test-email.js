require('dotenv').config();

// Simple nodemailer test script to verify SMTP connectivity and send a test message.
// Usage:
//   cd apps\order-service
//   node scripts\test-email.js

(async () => {
  try {
    // lazy require to match project pattern
    const nodemailer = require('nodemailer');

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = (process.env.SMTP_SECURE === 'true') || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.error('SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
      process.exit(2);
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: true,
      debug: true,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
      tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
    });

    console.log('Verifying transporter...');
    try {
      await transporter.verify();
      console.log('SMTP verify OK');
    } catch (vErr) {
      console.error('SMTP verify failed:', vErr && vErr.message ? vErr.message : vErr);
      if (vErr && vErr.stack) console.error(vErr.stack);
      process.exit(3);
    }

    console.log('Sending test message...');
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to: process.env.SMTP_TEST_TO || user,
        subject: 'Order-service SMTP test',
        text: 'This is a test message from order-service test-email.js'
      });
      console.log('Send success:', info);
      if (info && info.messageId) console.log('MessageId:', info.messageId);
    } catch (sErr) {
      console.error('Send failed:', sErr && sErr.message ? sErr.message : sErr);
      if (sErr && sErr.stack) console.error(sErr.stack);
      process.exit(4);
    }

    process.exit(0);
  } catch (err) {
    console.error('Unexpected error running test-email:', err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
