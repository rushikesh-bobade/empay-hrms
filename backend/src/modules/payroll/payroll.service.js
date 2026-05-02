const { pool } = require('../../config/db');
const PDFDocument = require('pdfkit');

class PayrollService {
  // ----- Salary Structures -----
  async upsertSalaryStructure(data) {
    const { employee_id, basic_salary, hra_percent, special_allowance, effective_from } = data;
    const result = await pool.query(
      `INSERT INTO salary_structures (employee_id, basic_salary, hra_percent, special_allowance, effective_from)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (employee_id)
       DO UPDATE SET basic_salary = $2, hra_percent = $3, special_allowance = $4, effective_from = $5, created_at = NOW()
       RETURNING *`,
      [employee_id, basic_salary, hra_percent || 40, special_allowance || 0, effective_from || new Date()]
    );
    return result.rows[0];
  }

  async getAllSalaryStructures() {
    const result = await pool.query(
      `SELECT ss.*, u.full_name, u.email, u.department, u.designation
       FROM salary_structures ss
       JOIN users u ON ss.employee_id = u.id
       ORDER BY u.full_name`
    );
    return result.rows;
  }

  async getSalaryStructure(employeeId) {
    const result = await pool.query(
      `SELECT ss.*, u.full_name, u.email, u.department, u.designation
       FROM salary_structures ss
       JOIN users u ON ss.employee_id = u.id
       WHERE ss.employee_id = $1`,
      [employeeId]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Salary structure not found for this employee' };
    }
    return result.rows[0];
  }

  // ----- Payruns -----
  _getWorkingDaysInMonth(month, year) {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }

  async generatePayrun(month, year, generatedBy) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if payrun exists
      let payrunResult = await client.query(
        'SELECT * FROM payruns WHERE month = $1 AND year = $2',
        [month, year]
      );

      let payrunId;
      if (payrunResult.rows.length > 0) {
        payrunId = payrunResult.rows[0].id;
        // Delete existing payslips to regenerate
        await client.query('DELETE FROM payslips WHERE payrun_id = $1', [payrunId]);
      } else {
        const newPayrun = await client.query(
          `INSERT INTO payruns (month, year, status, generated_by)
           VALUES ($1, $2, 'finalized', $3) RETURNING *`,
          [month, year, generatedBy]
        );
        payrunId = newPayrun.rows[0].id;
      }

      // Get all active employees with salary structures
      const employees = await client.query(
        `SELECT ss.*, u.id as user_id, u.full_name, u.department
         FROM salary_structures ss
         JOIN users u ON ss.employee_id = u.id
         WHERE u.is_active = true`
      );

      const working_days = this._getWorkingDaysInMonth(month, year);
      let payslipsCount = 0;

      for (const emp of employees.rows) {
        // Get attendance for this month
        const attendance = await client.query(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'present') as present_count,
             COUNT(*) FILTER (WHERE status = 'half_day') as half_day_count,
             COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave_count,
             COUNT(*) FILTER (WHERE status = 'unpaid_leave') as unpaid_leave_count
           FROM attendance
           WHERE employee_id = $1
             AND EXTRACT(MONTH FROM date) = $2
             AND EXTRACT(YEAR FROM date) = $3`,
          [emp.employee_id, month, year]
        );

        const att = attendance.rows[0];
        const present_days = parseFloat(att.present_count) + (parseFloat(att.half_day_count) * 0.5) + parseFloat(att.on_leave_count);
        const leaves_approved = parseInt(att.on_leave_count) + parseInt(att.unpaid_leave_count);
        const unpaid_leave_days = parseInt(att.unpaid_leave_count);

        // Payroll calculation
        const per_day = parseFloat(emp.basic_salary) / working_days;
        const effective_basic = per_day * present_days;
        const unpaid_deduction = per_day * unpaid_leave_days;
        const hra = (parseFloat(emp.hra_percent) / 100) * effective_basic;
        const special_allowance = parseFloat(emp.special_allowance);
        const gross_salary = effective_basic + hra + special_allowance;
        const pf_employee = 0.12 * effective_basic;
        const pf_employer = 0.12 * effective_basic;
        const professional_tax = gross_salary > 15000 ? 200 : 0;
        const total_deductions = pf_employee + professional_tax + unpaid_deduction;
        const net_pay = gross_salary - total_deductions;

        await client.query(
          `INSERT INTO payslips (payrun_id, employee_id, working_days, present_days, leaves_approved,
           unpaid_leave_days, unpaid_deduction, basic, hra, special_allowance, gross_salary, pf_employee, pf_employer,
           professional_tax, total_deductions, net_pay)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [payrunId, emp.employee_id, working_days,
           present_days.toFixed(2), leaves_approved, unpaid_leave_days, unpaid_deduction.toFixed(2),
           effective_basic.toFixed(2), hra.toFixed(2), special_allowance.toFixed(2),
           gross_salary.toFixed(2), pf_employee.toFixed(2), pf_employer.toFixed(2),
           professional_tax.toFixed(2), total_deductions.toFixed(2), net_pay.toFixed(2)]
        );
        payslipsCount++;
      }

      // Update payrun status
      await client.query(
        `UPDATE payruns SET status = 'finalized', generated_at = NOW() WHERE id = $1`,
        [payrunId]
      );

      await client.query('COMMIT');

      return { payrun_id: payrunId, payslips_generated_count: payslipsCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPayruns() {
    const result = await pool.query(
      `SELECT p.*, u.full_name as generated_by_name,
              (SELECT SUM(net_pay) FROM payslips WHERE payrun_id = p.id) as total_cost,
              (SELECT COUNT(*) FROM payslips WHERE payrun_id = p.id) as employee_count
       FROM payruns p
       LEFT JOIN users u ON p.generated_by = u.id
       ORDER BY p.year DESC, p.month DESC`
    );
    return result.rows;
  }

  async getPayrunPayslips(payrunId) {
    const result = await pool.query(
      `SELECT ps.*, u.full_name, u.email, u.department, u.designation
       FROM payslips ps
       JOIN users u ON ps.employee_id = u.id
       WHERE ps.payrun_id = $1
       ORDER BY u.full_name`,
      [payrunId]
    );
    return result.rows;
  }

  async getMyPayslips(employeeId) {
    const result = await pool.query(
      `SELECT ps.*, p.month, p.year, p.status as payrun_status
       FROM payslips ps
       JOIN payruns p ON ps.payrun_id = p.id
       WHERE ps.employee_id = $1
       ORDER BY p.year DESC, p.month DESC`,
      [employeeId]
    );
    return result.rows;
  }

  async getPayslipById(payslipId) {
    const result = await pool.query(
      `SELECT ps.*, p.month, p.year,
              u.full_name, u.email, u.department, u.designation, u.date_joined, u.id as user_id
       FROM payslips ps
       JOIN payruns p ON ps.payrun_id = p.id
       JOIN users u ON ps.employee_id = u.id
       WHERE ps.id = $1`,
      [payslipId]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Payslip not found' };
    }
    return result.rows[0];
  }

  _numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const intPart = Math.floor(num);

    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    return convert(intPart);
  }

  async generatePayslipPDF(payslipId) {
    const payslip = await this.getPayslipById(payslipId);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Header bar
    doc.rect(50, 50, 495, 50).fill('#1E3A5F');
    doc.fontSize(18).fillColor('#FFFFFF').text('EmPay Corp', 70, 62);
    doc.fontSize(14).text('PAYSLIP', 250, 65, { align: 'center', width: 100 });
    doc.fontSize(10).text(`${monthNames[payslip.month - 1]} ${payslip.year}`, 400, 68, { align: 'right', width: 130 });

    // Employee Details
    doc.fillColor('#333333');
    doc.rect(50, 120, 495, 80).lineWidth(1).stroke('#CCCCCC');
    doc.fontSize(10);
    doc.text(`Employee Name: ${payslip.full_name}`, 70, 135);
    doc.text(`Employee ID: ${payslip.user_id.substring(0, 8).toUpperCase()}`, 320, 135);
    doc.text(`Department: ${payslip.department || 'N/A'}`, 70, 155);
    doc.text(`Designation: ${payslip.designation || 'N/A'}`, 320, 155);
    doc.text(`Date of Joining: ${payslip.date_joined ? new Date(payslip.date_joined).toLocaleDateString() : 'N/A'}`, 70, 175);

    // Attendance summary
    doc.rect(50, 220, 495, 30).fill('#F0F4F8');
    doc.fillColor('#333333').fontSize(10);
    doc.text(`Working Days: ${payslip.working_days}`, 70, 228);
    doc.text(`Present Days: ${payslip.present_days}`, 220, 228);
    doc.text(`Leave Days: ${payslip.leaves_approved}`, 400, 228);

    // Earnings & Deductions
    const leftX = 50;
    const rightX = 300;
    let y = 270;

    // Earnings header
    doc.rect(leftX, y, 240, 25).fill('#1E3A5F');
    doc.fillColor('#FFFFFF').fontSize(11).text('EARNINGS', leftX + 10, y + 7);
    doc.text('Amount (Rs.)', leftX + 140, y + 7, { align: 'right', width: 90 });

    // Deductions header
    doc.rect(rightX, y, 245, 25).fill('#1E3A5F');
    doc.text('DEDUCTIONS', rightX + 10, y + 7);
    doc.text('Amount (Rs.)', rightX + 140, y + 7, { align: 'right', width: 95 });

    y += 30;
    doc.fillColor('#333333').fontSize(10);

    // Earnings items
    const earnings = [
      ['Basic Salary', parseFloat(payslip.basic).toFixed(2)],
      [`HRA (40%)`, parseFloat(payslip.hra).toFixed(2)],
      ['Special Allowance', parseFloat(payslip.special_allowance).toFixed(2)],
    ];

    const deductions = [
      ['PF Employee (12%)', parseFloat(payslip.pf_employee).toFixed(2)],
      ['Professional Tax', parseFloat(payslip.professional_tax).toFixed(2)],
    ];

    const maxRows = Math.max(earnings.length, deductions.length);
    for (let i = 0; i < maxRows; i++) {
      if (i < earnings.length) {
        doc.text(earnings[i][0], leftX + 10, y);
        doc.text(`Rs. ${earnings[i][1]}`, leftX + 140, y, { align: 'right', width: 90 });
      }
      if (i < deductions.length) {
        doc.text(deductions[i][0], rightX + 10, y);
        doc.text(`Rs. ${deductions[i][1]}`, rightX + 140, y, { align: 'right', width: 95 });
      }
      y += 20;
    }

    // Separator lines
    y += 5;
    doc.moveTo(leftX, y).lineTo(leftX + 240, y).stroke('#CCCCCC');
    doc.moveTo(rightX, y).lineTo(rightX + 245, y).stroke('#CCCCCC');
    y += 10;

    // Totals
    doc.font('Helvetica-Bold');
    doc.text('Gross Salary', leftX + 10, y);
    doc.text(`Rs. ${parseFloat(payslip.gross_salary).toFixed(2)}`, leftX + 140, y, { align: 'right', width: 90 });
    doc.text('Total Deductions', rightX + 10, y);
    doc.text(`Rs. ${parseFloat(payslip.total_deductions).toFixed(2)}`, rightX + 140, y, { align: 'right', width: 95 });

    // Net Pay box
    y += 40;
    doc.rect(50, y, 495, 50).fill('#1E3A5F');
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold');
    doc.text(`Net Pay: Rs. ${parseFloat(payslip.net_pay).toFixed(2)}`, 70, y + 15, { width: 455, align: 'center' });

    // Amount in words
    y += 60;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    doc.text(`Amount in words: Rupees ${this._numberToWords(parseFloat(payslip.net_pay))} Only`, 50, y);

    // Footer
    y += 40;
    doc.fontSize(8).fillColor('#999999');
    doc.text('This is a computer-generated payslip. No signature required.', 50, y, { align: 'center', width: 495 });

    doc.end();
    return { doc, filename: `payslip_${monthNames[payslip.month - 1]}_${payslip.year}.pdf` };
  }
}

module.exports = new PayrollService();
