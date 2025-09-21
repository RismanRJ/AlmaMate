const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transport = {
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.APP_PASSWORD,
    },
  };
  const transporter = nodemailer.createTransport(transport);
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    await transporter.sendMail(message);
    console.log("mail sent");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendEmail;
