import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (toMail, subject, body) => {
  try {
    await sgMail.send({
      to: toMail,
      from: process.env.FROM_EMAIL, // verified sender
      subject,
      html: body,
    });

    console.log(`✅ Email sent to ${toMail}`);
  } catch (err) {
    console.error("❌ SendGrid error:", err?.response?.body || err);
    throw err;
  }
};

export default sendEmail;
