const nodemailer = require('nodemailer');

let transporter;

const initMailer = async () => {
  // If SMTP credentials are provided, use real SMTP (works in any environment)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transportConfig = {
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // If it's gmail, use the service shortcut for better reliability
    if (process.env.SMTP_HOST?.includes('gmail') || process.env.SMTP_USER?.includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.SMTP_HOST || 'smtp.gmail.com';
      transportConfig.port = parseInt(process.env.SMTP_PORT) || 587;
      transportConfig.secure = process.env.SMTP_SECURE === 'true';
    }

    transporter = nodemailer.createTransport(transportConfig);
    console.log(`📧 SMTP configured for ${transportConfig.service || transportConfig.host}.`);
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
  
  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text,
  };
  if (html) {
    mailOptions.html = html;
  }
  const info = await transporter.sendMail(mailOptions);

  // Log preview URL only for Ethereal (test mode)
  const safeTo = String(to).replace(/[\r\n\t%]/g, '');
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('[TEST] Message sent:', info.messageId);
    console.log('Preview URL:', previewUrl);
  } else {
    console.log('Email sent to', safeTo, info.messageId);
  }

  return info;
};

module.exports = { sendEmail };
