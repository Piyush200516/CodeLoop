const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!options?.email) {
        throw new Error('sendEmail: options.email is required');
    }
    if (!options?.subject) {
        throw new Error('sendEmail: options.subject is required');
    }
    if (!options?.html) {
        throw new Error('sendEmail: options.html is required');
    }

    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        FROM_EMAIL,
    } = process.env;

    // Validate required env vars (fail fast)
    if (!SMTP_HOST) throw new Error('SMTP_HOST is not set in environment variables');
    if (!SMTP_PORT) throw new Error('SMTP_PORT is not set in environment variables');
    if (!SMTP_USER) throw new Error('SMTP_USER is not set in environment variables');
    if (!SMTP_PASS) throw new Error('SMTP_PASS is not set in environment variables');
    if (!FROM_EMAIL) throw new Error('FROM_EMAIL is not set in environment variables');

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: false, // STARTTLS for 587
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
        // Brevo supports standard SMTP; no special TLS config by default.
        // If you ever hit TLS errors, you can set tls: { rejectUnauthorized: false }
    });

    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: options.email,
            subject: options.subject,
            html: options.html,
        });

        console.log('✅ EMAIL SENT SUCCESSFULLY');
        console.log('MessageId:', info?.messageId);
    } catch (error) {
        console.error('❌ EMAIL SEND FAILED');
        console.error('Error message:', error?.message);
        console.error('Full error:', error);
        throw error;
    }
};

module.exports = sendEmail;

