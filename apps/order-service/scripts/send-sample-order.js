require('dotenv').config();

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

(async () => {
  try {
    // Resolve template path relative to this script so process.cwd() won't duplicate paths
    const templatePath = path.join(__dirname, '..', 'src', 'utils', 'send-email', 'order-comfirmation-email.ejs');

    const sampleOrder = {
      id: 'SAMPLE-ORD-001',
      createdAt: new Date().toISOString(),
      totalAmount: 80,
      products: [
        { name: 'Widget', price: 80, quantity: 1 }
      ],
      shippingAddress: {
        name: 'Test Customer',
        line1: '123 Example St',
        city: 'City',
        postalCode: '00000',
        country: 'Nowhere'
      }
    };

    console.log('Rendering template from', templatePath);
    const html = await ejs.renderFile(templatePath, { order: sampleOrder });

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = (process.env.SMTP_SECURE === 'true') || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.SMTP_TEST_TO || user;

    if (!host || !user || !pass) {
      console.error('SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
      process.exit(2);
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: process.env.SMTP_DEBUG === 'true',
      debug: process.env.SMTP_DEBUG === 'true',
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
      tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
    });

    console.log('Verifying transporter...');
    try {
      await transporter.verify();
      console.log('SMTP verify OK');
    } catch (vErr) {
      console.error('SMTP verify failed:', vErr && vErr.message ? vErr.message : vErr);
      if (vErr && vErr.stack) console.error(vErr.stack);
      // continue to attempt send, verify may be overly strict
    }

    console.log('Sending sample order confirmation to', to);
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to,
        subject: `Sample Order Confirmation - ${sampleOrder.id}`,
        html,
      });
      console.log('Send success:', info);
      if (info && info.messageId) console.log('MessageId:', info.messageId);
      process.exit(0);
    } catch (sErr) {
      console.error('Send failed:', sErr && sErr.message ? sErr.message : sErr);
      if (sErr && sErr.stack) console.error(sErr.stack);
      process.exit(4);
    }
  } catch (err) {
    console.error('Unexpected error running send-sample-order:', err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
