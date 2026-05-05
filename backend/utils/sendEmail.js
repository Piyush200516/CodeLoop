const { Resend } = require('resend');

const sendEmail = async (options) => {
    const apiKey = process.env.RESEND_API_KEY;

    // Step 1 — Check env variable
    console.log("RESEND_API_KEY:", apiKey ? "Loaded" : "❌ Missing");

    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set in environment variables");
    }

    const fromEmail = process.env.FROM_EMAIL;
    console.log("FROM_EMAIL:", fromEmail ? "Loaded" : "❌ Missing (using fallback)");

    const resend = new Resend(apiKey);

    console.log("Resend client created");

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail || 'onboarding@resend.dev',
            to: options.email,
            subject: options.subject,
            html: options.html,
        });

        if (error) {
            console.error("❌ EMAIL SEND FAILED");
            console.error("Error:", error);
            throw new Error(error.message || "Resend email failed");
        }

        console.log("✅ EMAIL SENT SUCCESSFULLY");
        console.log("Email ID:", data?.id);

    } catch (error) {
        console.error("❌ EMAIL SEND FAILED");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        throw error;
    }
};

module.exports = sendEmail;
