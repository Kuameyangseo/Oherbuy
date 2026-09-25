#!/usr/bin/env node
/*
Simple CLI to resend an order confirmation email.
Usage:
  node scripts/send-order-confirmation.js --orderId ORD-12345 --email user@example.com [--items '[{"title":"Item","quantity":1,"price":9.99}]' ]

It prefers SendGrid if SENDGRID_API_KEY is set, otherwise uses SMTP env vars: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_FROM
*/

const fs = require('fs')
const path = require('path')

// load .env if present (root .env first, then apps/user-ui/.env)
try {
  const dotenv = require('dotenv')
  // try root .env
  dotenv.config()
  if (!process.env.SENDGRID_API_KEY && !process.env.SMTP_HOST) {
    const alt = path.join(__dirname, '..', 'apps', 'user-ui', '.env')
    if (fs.existsSync(alt)) {
      dotenv.config({ path: alt })
    }
  }
} catch (e) {
  // dotenv not installed — continue, script will fall back to explicit env vars
}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = args[i+1] && !args[i+1].startsWith('--') ? args[i+1] : 'true'
      out[key] = val
      if (val !== 'true') i++
    }
  }
  return out
}

async function main() {
  const argv = parseArgs()
  const orderId = argv.orderId || argv.order || argv.id
  const email = argv.email || argv.to
  const items = argv.items ? JSON.parse(argv.items) : (argv._items ? JSON.parse(argv._items) : [])
  const total = argv.total || (items.length ? items.reduce((s,i)=>s+((Number(i.price)||0)*(i.quantity||1)),0).toFixed(2) : argv.amount || '0.00')

  if (!orderId || !email) {
    console.error('Usage: node scripts/send-order-confirmation.js --orderId ORD-123 --email user@example.com --items "[...json...]"')
    process.exit(2)
  }

  const html = `
    <h2>Order Confirmation</h2>
    <p>Order ID: <strong>${orderId}</strong></p>
    <h3>Items</h3>
    <ul>
      ${Array.isArray(items) ? items.map((it) => `<li>${(it.title||it.name)||''} — ${it.quantity} x $${Number(it.price||0).toFixed(2)}</li>`).join('') : ''}
    </ul>
    <p>Total: $${Number(total||0).toFixed(2)}</p>
  `

  const sendgridKey = process.env.SENDGRID_API_KEY
  if (sendgridKey) {
    console.log('Using SendGrid to send email')
    try {
      const bodySend = {
        personalizations: [{ to: [{ email }], subject: `Order confirmation — ${orderId}` }],
        from: { email: process.env.SENDGRID_FROM || process.env.SMTP_FROM || 'no-reply@example.com' },
        content: [{ type: 'text/html', value: html }]
      }
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodySend)
      })
      if (!r.ok) {
        const txt = await r.text()
        console.error('SendGrid error', r.status, txt)
        process.exit(1)
      }
      console.log('Email sent via SendGrid')
      process.exit(0)
    } catch (err) {
      console.error('SendGrid send failed', err)
      process.exit(1)
    }
  }

  // fallback to nodemailer SMTP
  const nodemailerAvailable = (() => {
    try { require.resolve('nodemailer'); return true } catch (e) { return false }
  })()

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user

  if (!host || !user || !pass) {
    console.error('No mail provider configured. Set SENDGRID_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS in env.')
    process.exit(1)
  }

  if (!nodemailerAvailable) {
    console.error('nodemailer is not installed. Run `npm install nodemailer` in the workspace root or use SendGrid.')
    process.exit(1)
  }

  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass }
    })

    await transporter.sendMail({
      from: from,
      to: email,
      subject: `Order confirmation — ${orderId}`,
      html
    })

    console.log('Email sent via SMTP')
    process.exit(0)
  } catch (err) {
    console.error('Failed to send email via SMTP', err)
    process.exit(1)
  }
}

// Node18+ has global fetch. If not, try to polyfill with node-fetch
if (typeof fetch === 'undefined') {
  try {
    global.fetch = require('node-fetch')
  } catch (e) {
    // will still attempt nodemailer path if sendgrid not used
  }
}

main().catch((err)=>{ console.error(err); process.exit(1) })
