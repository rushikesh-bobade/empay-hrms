const nodemailer = require('nodemailer');

let transporter;

const initMailer = async () => {
  // If SMTP credentials are provided, use real SMTP (works in any environment)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`📧 Real SMTP configured (${process.env.SMTP_HOST}). Emails will be delivered to real inboxes.`);
  } else {
    // Fallback: Ethereal test account (emails only visible via preview URL, not delivered)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('📧 No SMTP configured — using Ethereal (test). Emails won\'t reach real inboxes.');
    console.log('   To send real emails, add SMTP_HOST, SMTP_USER, SMTP_PASS to .env');
  }
};

initMailer().catch(console.error);

const sendEmail = async (to, subject, text, html = '') => {
  if (!transporter) await initMailer();
  
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"EmPay HRMS" <no-reply@empay.local>';
  
  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html: html || text
  });

  // Log preview URL only for Ethereal (test mode)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`✉️ [TEST] Message sent: ${info.messageId}`);
    console.log(`🔗 Preview URL: ${previewUrl}`);
  } else {
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
  }

  return info;
};

module.exports = { sendEmail };
