const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4d8eff, #571bc1); padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .content { padding: 40px 40px; color: #334155; line-height: 1.6; font-size: 16px; }
    .content h2 { color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.01em; }
    .content p { margin-bottom: 20px; color: #64748b; }
    .data-table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #f1f5f9; border-radius: 12px; overflow: hidden; }
    .data-table td { padding: 16px 20px; font-size: 14px; }
    .data-table td.label { font-weight: 600; color: #475569; width: 35%; border-bottom: 1px solid #e2e8f0; }
    .data-table td.value { color: #1e293b; border-bottom: 1px solid #e2e8f0; }
    .footer { padding: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
    .footer p { margin: 4px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #4d8eff, #571bc1); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin: 20px 0; box-shadow: 0 4px 12px rgba(77, 142, 255, 0.25); }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .status-approved { background: #dcfce7; color: #15803d; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
    .status-warning { background: #fef3c7; color: #d97706; }
    .status-info { background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>EmPay</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p><strong>EmPay HRMS Platform</strong></p>
        <p>Secure Enterprise Human Resource Management</p>
        <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} EmPay Ltd. All rights reserved.</p>
        <p>You received this email because of your employee account activity.</p>
      </div>
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
      <p>Your leave request has been processed. Please find the details below:</p>
      <table class="data-table">
        <tr>
          <td class="label">Leave Type</td>
          <td class="value">${leaveType}</td>
        </tr>
        <tr>
          <td class="label">Duration</td>
          <td class="value">${startDate} to ${endDate}</td>
        </tr>
        <tr>
          <td class="label">Current Status</td>
          <td class="value"><span class="status-badge ${statusClass}">${status}</span></td>
        </tr>
      </table>
      <p>If you have any questions, please contact your department head or HR representative.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="btn">View Dashboard</a>
      </div>
    `;
    return baseTemplate(`Leave Request ${status}`, content);
  },
  
  resetPasswordEmail: (name, resetLink) => {
    const content = `
      <h2>Security: Reset Your Password</h2>
      <p>Hi ${name || 'User'},</p>
      <p>We received a request to reset the password for your EmPay HRMS account. To proceed, click the button below:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetLink}" class="btn">Reset My Password</a>
      </div>
      <p style="font-size: 14px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <strong>Security Note:</strong> If you did not request this change, please ignore this email or contact support if you have concerns. This link will expire in 1 hour.
      </p>
    `;
    return baseTemplate('Password Reset Request', content);
  },

  welcomeEmail: (name, email, password, role, loginUrl) => {
    const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const content = `
      <h2>Welcome to the Team! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your official <strong>EmPay HRMS</strong> account is ready. You can now access your employee portal using the credentials below:</p>
      <table class="data-table">
        <tr>
          <td class="label">Email Address</td>
          <td class="value" style="font-weight: 500;">${email}</td>
        </tr>
        <tr>
          <td class="label">Temporary Password</td>
          <td class="value" style="font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 1px; color: #571bc1;">${password}</td>
        </tr>
        <tr>
          <td class="label">Designated Role</td>
          <td class="value">${roleName}</td>
        </tr>
      </table>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" class="btn">Login to Portal</a>
      </div>
      <div style="background: #fff9eb; padding: 20px; border-radius: 12px; border: 1px solid #ffeeba;">
        <p style="margin: 0; font-size: 14px; color: #926c05;">
          <strong>⚠️ Action Required:</strong> For your security, you will be prompted to change this temporary password upon your first successful login.
        </p>
      </div>
    `;
    return baseTemplate('Welcome to EmPay HRMS', content);
  },

  alertEmail: (title, message, type = 'info') => {
    const typeClass = `status-${type}`;
    const content = `
      <h2>System Alert 📧</h2>
      <p>An automated HRMS event requires your attention:</p>
      <div style="padding: 24px; background: #f8fafc; border-radius: 12px; border-left: 5px solid ${type === 'warning' ? '#d97706' : '#4d8eff'}; margin: 25px 0;">
        <div style="margin-bottom: 12px;">
          <span class="status-badge ${typeClass}">${title}</span>
        </div>
        <p style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 500;">${message}</p>
      </div>
      <p>Please log in to the management dashboard to take any necessary actions.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard" class="btn">Go to Dashboard</a>
      </div>
    `;
    return baseTemplate('EmPay System Alert', content);
  }
};
