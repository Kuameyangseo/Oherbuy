import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

// node fetch is available on newer Node versions; no extra dependency assumed
// If running on older Node, consider installing node-fetch and updating this file.

dotenv.config();

const transporterOptions: any = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // timeouts (ms)
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 30000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 30000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 60000),
  tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' },
};

if (process.env.SMTP_DEBUG === 'true') {
  transporterOptions.logger = true;
  transporterOptions.debug = true;
}

const transporter = nodemailer.createTransport(transporterOptions);

const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    'apps',
    'order-service',
    'src',
    'utils',
    'send-email',
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    // Prefer SendGrid API when configured (HTTP fallback to SMTP)
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey) {
      try {
        const payload = {
          personalizations: [{ to: [{ email: to }], subject }],
          from: { email: process.env.SENDGRID_FROM || process.env.SMTP_FROM || 'no-reply@example.com' },
          content: [{ type: 'text/html', value: html }],
        };

        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '<no body>');
          console.error('[send-email] SendGrid error', res.status, txt);
          // fallthrough to SMTP attempt as a backup
        } else {
          return true;
        }
      } catch (sgErr: any) {
        console.error('[send-email] SendGrid request failed', sgErr && sgErr.message ? sgErr.message : sgErr);
        // fallthrough to SMTP attempt
      }
    }

    // verify transport before sending (best-effort)
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error('[send-email] transporter verify failed', verifyErr instanceof Error && verifyErr.message ? verifyErr.message : verifyErr);
      // proceed to attempt send; verify failure may still allow send
    }

    await transporter.sendMail({
      from: `<${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error: any) {
    console.error('Error sending order email', error && error.message ? error.message : error);
    if (error && error.stack) console.error(error.stack);
    return false;
  }
};
