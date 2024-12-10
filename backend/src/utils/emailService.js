const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderConfirmationEmail = (to, orderDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Order Confirmation',
    text: `Thank you for your order! Here are the details:\n\n${orderDetails}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

const sendPasswordResetEmail = (to, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetUrl}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = { sendOrderConfirmationEmail, sendPasswordResetEmail };
