const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!options?.email) throw new Error('sendEmail: options.email is required');
  if (!options?.subject) throw new Error('sendEmail: options.subject is required');
  if (!options?.html) throw new Error('sendEmail: options.html is required');

  // Read SMTP env vars
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const FROM_EMAIL = process.env.FROM_EMAIL;

  // Validate required env vars (fail fast)
  if (!SMTP_HOST) throw new Error('SMTP_HOST is not set in environment variables');
  if (!SMTP_USER) throw new Error('SMTP_USER is not set in environment variables');
  if (!SMTP_PASS) throw new Error('SMTP_PASS is not set in environment variables');
  if (!FROM_EMAIL) throw new Error('FROM_EMAIL is not set in environment variables');

  // Brevo SMTP port fallback requirement
  const port = Number(process.env.SMTP_PORT || 587);

  // Detailed logs (NO SMTP_PASS)
  console.log('[sendEmail] preparing transporter (no secrets):', {
    to: options.email,
    subject: options.subject,
    SMTP_HOST_present: !!SMTP_HOST,
    SMTP_PORT_raw: SMTP_PORT,
    SMTP_PORT_used: port,
    SMTP_USER_present: !!SMTP_USER,
    FROM_EMAIL_present: !!FROM_EMAIL,
    secure: false
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  try {
    // Ensure FROM comes from env
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: options.email,
      subject: options.subject,
      html: options.html
    });

    console.log('[sendEmail] ✅ EMAIL SENT SUCCESSFULLY', {
      messageId: info?.messageId
    });

    return info;
  } catch (error) {
    // Exact SMTP error message in backend logs
    console.error('[sendEmail] ❌ EMAIL SEND FAILED');
    console.error('[sendEmail] SMTP error message (exact):', error?.message);
    console.error('[sendEmail] SMTP error code:', error?.code);
    console.error('[sendEmail] SMTP responseCode:', error?.responseCode);
    console.error('[sendEmail] SMTP response:', error?.response);

    // Throw an error whose message is the exact SMTP error message
    throw new Error(error?.message || 'Unknown SMTP error');
  }
};

module.exports = sendEmail;

