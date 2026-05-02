const { pool } = require('../../config/db');
const PDFDocument = require('pdfkit');

// ---------- Salary Structures ----------
const upsertSalaryStructure = async ({ employee_id, basic_salary, hra_percent, special_allowance, effective_from }) => {
  const result = await pool.query(
    `INSERT INTO salary_structures (employee_id, basic_salary, hra_percent, special_allowance, effective_from)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (employee_id) DO UPDATE SET
       basic_salary = $2, hra_percent = $3, special_allowance = $4, effective_from = $5, created_at = NOW()
     RETURNING *`,
    [employee_id, basic_salary, hra_percent || 40, special_allowance || 0, effective_from || new Date()]
  );
  return result.rows[0];
};

const getAllSalaryStructures = async () => {
  const result = await pool.query(
    `SELECT ss.*, u.full_name, u.email, u.department, u.designation
     FROM salary_structures ss
     JOIN users u ON ss.employee_id = u.id
     ORDER BY u.full_name`
  );
  return result.rows;
};

const getSalaryStructure = async (employeeId) => {
  const result = await pool.query(
    `SELECT ss.*, u.full_name, u.email, u.department, u.designation
     FROM salary_structures ss
     JOIN users u ON ss.employee_id = u.id
     WHERE ss.employee_id = $1`,
    [employeeId]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'Salary structure not found.' };
  return result.rows[0];
};

// ---------- Payruns ----------
const generatePayrun = async (month, year, generatedBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if payrun already exists
    let payrunResult = await client.query(
      'SELECT * FROM payruns WHERE month = $1 AND year = $2', [month, year]
    );

    let payrun;
    if (payrunResult.rows.length > 0) {
      payrun = payrunResult.rows[0];
      // Delete existing payslips for re-generation
      await client.query('DELETE FROM payslips WHERE payrun_id = $1', [payrun.id]);
    } else {
      const newPayrun = await client.query(
        `INSERT INTO payruns (month, year, generated_by) VALUES ($1, $2, $3) RETURNING *`,
        [month, year, generatedBy]
      );
      payrun = newPayrun.rows[0];
    }

    // Calculate working days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }

    // Get all active employees with salary structures
    const employees = await client.query(
      `SELECT u.id, u.full_name, u.department, u.designation, u.date_joined,
              ss.basic_salary, ss.hra_percent, ss.special_allowance
       FROM users u
       JOIN salary_structures ss ON u.id = ss.employee_id
       WHERE u.is_active = true`
    );

    let payslipsCount = 0;
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`;

    for (const emp of employees.rows) {
      // Count present days and leaves
      const attendanceResult = await client.query(
        `SELECT
           COALESCE(SUM(CASE WHEN status = 'present' THEN 1 WHEN status = 'half_day' THEN 0.5 WHEN status = 'on_leave' THEN 1 ELSE 0 END), 0) AS present_days,
           COALESCE(COUNT(*) FILTER (WHERE status = 'on_leave'), 0) AS leaves_approved
         FROM attendance
         WHERE employee_id = $1 AND date BETWEEN $2 AND $3`,
        [emp.id, firstDay, lastDay]
      );

      const { present_days, leaves_approved } = attendanceResult.rows[0];
      const presentDays = parseFloat(present_days);
      const leavesApproved = parseInt(leaves_approved);

      // Payroll calculation
      const basicSalary = parseFloat(emp.basic_salary);
      const hraPercent = parseFloat(emp.hra_percent);
      const specialAllowance = parseFloat(emp.special_allowance);

      const perDay = basicSalary / workingDays;
      const effectiveBasic = perDay * presentDays;
      const hra = (hraPercent / 100) * effectiveBasic;
      const grossSalary = effectiveBasic + hra + specialAllowance;
      const pfEmployee = 0.12 * effectiveBasic;
      const pfEmployer = 0.12 * effectiveBasic;
      const professionalTax = grossSalary > 15000 ? 200 : 0;
      const totalDeductions = pfEmployee + professionalTax;
      const netPay = grossSalary - totalDeductions;

      await client.query(
        `INSERT INTO payslips (payrun_id, employee_id, working_days, present_days, leaves_approved,
         basic, hra, special_allowance, gross_salary, pf_employee, pf_employer,
         professional_tax, total_deductions, net_pay)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [payrun.id, emp.id, workingDays, presentDays, leavesApproved,
         effectiveBasic.toFixed(2), hra.toFixed(2), specialAllowance.toFixed(2),
         grossSalary.toFixed(2), pfEmployee.toFixed(2), pfEmployer.toFixed(2),
         professionalTax.toFixed(2), totalDeductions.toFixed(2), netPay.toFixed(2)]
      );
      payslipsCount++;
    }

    await client.query('COMMIT');
    return { payrun, payslips_generated_count: payslipsCount };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getAllPayruns = async () => {
  const result = await pool.query(
    `SELECT p.*, u.full_name AS generated_by_name,
            COALESCE(SUM(ps.net_pay), 0) AS total_cost,
            COUNT(ps.id) AS payslip_count
     FROM payruns p
     LEFT JOIN users u ON p.generated_by = u.id
     LEFT JOIN payslips ps ON p.id = ps.payrun_id
     GROUP BY p.id, u.full_name
     ORDER BY p.year DESC, p.month DESC`
  );
  return result.rows;
};

const getPayrunPayslips = async (payrunId) => {
  const result = await pool.query(
    `SELECT ps.*, u.full_name, u.email, u.department, u.designation
     FROM payslips ps
     JOIN users u ON ps.employee_id = u.id
     WHERE ps.payrun_id = $1
     ORDER BY u.full_name`,
    [payrunId]
  );
  return result.rows;
};

const getMyPayslips = async (employeeId) => {
  const result = await pool.query(
    `SELECT ps.*, p.month, p.year, p.status AS payrun_status
     FROM payslips ps
     JOIN payruns p ON ps.payrun_id = p.id
     WHERE ps.employee_id = $1
     ORDER BY p.year DESC, p.month DESC`,
    [employeeId]
  );
  return result.rows;
};

const getPayslipById = async (payslipId) => {
  const result = await pool.query(
    `SELECT ps.*, p.month, p.year, p.status AS payrun_status,
            u.full_name, u.email, u.department, u.designation, u.date_joined
     FROM payslips ps
     JOIN payruns p ON ps.payrun_id = p.id
     JOIN users u ON ps.employee_id = u.id
     WHERE ps.id = $1`,
    [payslipId]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'Payslip not found.' };
  return result.rows[0];
};

const finalizePayrun = async (payrunId) => {
  const result = await pool.query(
    `UPDATE payruns SET status = 'finalized' WHERE id = $1 RETURNING *`,
    [payrunId]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'Payrun not found.' };
  return result.rows[0];
};

// ---------- PDF Generation ----------
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  const n = Math.floor(Math.abs(num));

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  return 'Rupees ' + convert(n) + ' Only';
};

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const generatePayslipPDF = async (payslipId) => {
  const payslip = await getPayslipById(payslipId);

  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  // Header bar
  doc.rect(40, 40, 515, 50).fill('#1E3A5F');
  doc.fontSize(18).fillColor('white').text('EmPay Corp', 55, 52);
  doc.fontSize(14).text('PAYSLIP', 250, 55, { align: 'center', width: 100 });
  doc.fontSize(10).text(`${monthNames[payslip.month - 1]} ${payslip.year}`, 400, 58, { align: 'right', width: 140 });

  // Employee details box
  doc.fillColor('#333');
  doc.rect(40, 105, 515, 80).stroke('#ddd');
  doc.fontSize(10)
    .text(`Employee Name: ${payslip.full_name}`, 55, 115)
    .text(`Department: ${payslip.department || 'N/A'}`, 320, 115)
    .text(`Designation: ${payslip.designation || 'N/A'}`, 55, 135)
    .text(`Email: ${payslip.email}`, 320, 135)
    .text(`Date of Joining: ${new Date(payslip.date_joined).toLocaleDateString('en-IN')}`, 55, 155)
    .text(`Working Days: ${payslip.working_days} | Present: ${payslip.present_days} | Leaves: ${payslip.leaves_approved}`, 320, 155);

  // Earnings and Deductions
  const tableY = 205;

  // Earnings header
  doc.rect(40, tableY, 257, 25).fill('#f0f4ff');
  doc.fillColor('#1E3A5F').fontSize(11).text('EARNINGS', 55, tableY + 7);

  // Deductions header
  doc.rect(297, tableY, 258, 25).fill('#fff0f0');
  doc.fillColor('#c0392b').text('DEDUCTIONS', 312, tableY + 7);

  doc.fillColor('#333').fontSize(10);

  // Earnings rows
  let y = tableY + 35;
  const earningsItems = [
    ['Basic Salary', payslip.basic],
    [`HRA (${40}%)`, payslip.hra],
    ['Special Allowance', payslip.special_allowance],
  ];

  for (const [label, value] of earningsItems) {
    doc.text(label, 55, y);
    doc.text(`Rs. ${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 180, y, { align: 'right', width: 100 });
    y += 20;
  }

  // Earnings separator
  doc.moveTo(55, y).lineTo(280, y).stroke('#ccc');
  y += 8;
  doc.font('Helvetica-Bold').text('Gross Salary', 55, y);
  doc.text(`Rs. ${parseFloat(payslip.gross_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 180, y, { align: 'right', width: 100 });

  // Deductions rows
  y = tableY + 35;
  const deductionItems = [
    ['PF Employee (12%)', payslip.pf_employee],
    ['Professional Tax', payslip.professional_tax],
  ];

  for (const [label, value] of deductionItems) {
    doc.font('Helvetica').text(label, 312, y);
    doc.text(`Rs. ${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 440, y, { align: 'right', width: 100 });
    y += 20;
  }

  // PF Employer info
  doc.fontSize(8).fillColor('#888').text(`(PF Employer: Rs. ${parseFloat(payslip.pf_employer).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`, 312, y);
  y += 15;

  // Deductions separator
  doc.moveTo(312, y).lineTo(540, y).stroke('#ccc');
  y += 8;
  doc.fillColor('#333').fontSize(10).font('Helvetica-Bold').text('Total Deductions', 312, y);
  doc.text(`Rs. ${parseFloat(payslip.total_deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 440, y, { align: 'right', width: 100 });

  // Net Pay box
  const netPayY = Math.max(y, tableY + 35 + earningsItems.length * 20 + 30) + 40;
  doc.rect(40, netPayY, 515, 45).fill('#1E3A5F');
  doc.fillColor('white').fontSize(16).font('Helvetica-Bold');
  doc.text(`Net Pay: Rs. ${parseFloat(payslip.net_pay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 55, netPayY + 14, { align: 'center', width: 485 });

  // Amount in words
  doc.fillColor('#555').fontSize(10).font('Helvetica');
  doc.text(numberToWords(parseFloat(payslip.net_pay)), 55, netPayY + 60);

  // Footer
  doc.fillColor('#999').fontSize(8);
  doc.text('This is a computer-generated payslip. No signature required.', 55, 740, { align: 'center', width: 485 });

  return { doc, payslip };
};

module.exports = {
  upsertSalaryStructure, getAllSalaryStructures, getSalaryStructure,
  generatePayrun, getAllPayruns, getPayrunPayslips, getMyPayslips,
  getPayslipById, finalizePayrun, generatePayslipPDF, monthNames,
};
