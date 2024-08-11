const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, firstName, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.Email_host,
    port: parseInt(process.env.Email_port, 10),
    secure: process.env.Email_port === '465',
    auth: {
      user: process.env.Email_username,
      pass: process.env.Email_password,
    },
    socketTimeout: 60000,
    connectionTimeout: 60000,
    debug: true,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.Email_username,
      to: email,
      subject: 'Forgot Password',
      text: message,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

module.exports = sendOtpEmail;
