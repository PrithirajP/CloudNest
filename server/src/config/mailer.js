import nodemailer from "nodemailer";

// 1. Create the Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. Non-blocking Verification (Optional but safer)
// We use .then() here so it runs in the background and doesn't block app startup
transporter.verify()
  .then(() => {
    console.log("✅ SMTP Server Connected. Ready to send emails.");
  })
  .catch((error) => {
    console.error("❌ SMTP Connection Error:", error.message);
    // Suggestion: Don't process.exit(1) here; let the app run even if email is down.
  });

/**
 * Sends an email using the configured transporter.
 * @param {string} toMail - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - HTML body of the email
 */
const sendEmail = async (toMail, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL, // Ensure this matches or is authorized by SMTP_USER
      to: toMail,
      subject,
      html: body,
    });
    
    console.log(`Email sent to ${toMail}: ${info.messageId}`);
    return info; // Return info in case the controller needs it
  } catch (err) {
    console.error(`Failed to send email to ${toMail}:`, err.message);
    throw err; // Re-throw so the calling controller knows it failed
  }
};

export default sendEmail;