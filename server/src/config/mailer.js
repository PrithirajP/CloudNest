import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// OPTIONAL but STRONGLY recommended
await transporter.verify();

const sendEmail = async (toMail, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: toMail,
      subject,
      html: body,
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email failed:", err);
    throw err;
  }
};

export default sendEmail;
