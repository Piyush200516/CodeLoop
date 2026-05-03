const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
    console.log("Testing with:", process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        family: 4,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
        connectionTimeout: 20000,
        greetingTimeout: 10000,
        socketTimeout: 30000,
    });

    console.log("Verifying transporter...");
    try {
        await new Promise((resolve, reject) => {
            transporter.verify((error, success) => {
                if (error) {
                    console.error("SMTP VERIFY ERROR:", error);
                    reject(error);
                } else {
                    console.log("SMTP READY");
                    resolve(success);
                }
            });
        });

        const mailOptions = {
            from: `CodeRecall <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Script',
            text: 'This is a test email to verify Nodemailer configuration.',
        };

        console.log("Sending mail...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
    } catch (err) {
        console.error("TEST FAILED:", err);
    }
};

testEmail();
