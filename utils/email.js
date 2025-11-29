const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  // 1)- create transporter how send mail to user
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
  
  // Specify mail options like who you send to ,content and Title
  const mailOptions = {
    from: "Studify <studify4support@gmail.com>",
    to: options.to,
    subject: options.subject,
    text: options.content,
  }

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;