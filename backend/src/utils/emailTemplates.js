const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4d8eff, #571bc1); padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px; }
    .content h2 { color: #1a1a1a; font-size: 20px; margin-top: 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888888; font-size: 13px; border-top: 1px solid #eeeeee; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4d8eff, #571bc1); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; margin-bottom: 20px; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; }
    .status-approved { background: #e0f2fe; color: #0284c7; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EmPay HRMS</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} EmPay Ltd. All rights reserved.</p>
      <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  leaveStatusEmail: (name, leaveType, startDate, endDate, status) => {
    const statusClass = status === 'Approved' ? 'status-approved' : 'status-rejected';
    const content = `
      <h2>Leave Request Update</h2>
      <p>Hi ${name},</p>
      <p>There has been an update to your recent leave request.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-weight: 600; color: #555;">Type:</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333;">${leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-weight: 600; color: #555;">Dates:</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333;">${startDate} to ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; font-weight: 600; color: #555;">Status:</td>
          <td style="padding: 12px 15px;">
            <span class="status-badge ${statusClass}">${status}</span>
          </td>
        </tr>
      </table>
      <p>If you have any questions regarding this decision, please contact your HR representative.</p>
    `;
    return baseTemplate(`Leave Request ${status}`, content);
  },
  
  resetPasswordEmail: (name, resetLink) => {
    const content = `
      <h2>Password Reset Request</h2>
      <p>Hi ${name || 'User'},</p>
      <p>We received a request to reset your password for your EmPay HRMS account. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, please click the button below:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="btn" style="color: #ffffff;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetLink}" style="color: #4d8eff; word-break: break-all;">${resetLink}</a>
      </p>
    `;
    return baseTemplate('Password Reset Request', content);
  },

  welcomeEmail: (name, email, password, role, loginUrl) => {
    const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const content = `
      <h2>Welcome to EmPay HRMS! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created on <strong>EmPay HRMS</strong>. You can now log in and start using the platform.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-weight: 600; color: #555;">Email:</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-weight: 600; color: #555;">Password:</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333; font-family: monospace; letter-spacing: 1px;">${password}</td>
        </tr>
        <tr>
          <td style="padding: 12px 15px; font-weight: 600; color: #555;">Role:</td>
          <td style="padding: 12px 15px; color: #333;">${roleName}</td>
        </tr>
      </table>
      <div style="text-align: center;">
        <a href="${loginUrl}" class="btn" style="color: #ffffff;">Login to EmPay</a>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        <strong>⚠️ Important:</strong> For security, please change your password after your first login by visiting your Profile page.
      </p>
    `;
    return baseTemplate('Welcome to EmPay HRMS', content);
  }
};
