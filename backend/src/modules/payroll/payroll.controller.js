const payrollService = require('./payroll.service');

const upsertSalaryStructure = async (req, res) => {
  try {
    const data = await payrollService.upsertSalaryStructure(req.body);
    res.json({ success: true, message: 'Salary structure saved.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getAllSalaryStructures = async (req, res) => {
  try {
    const data = await payrollService.getAllSalaryStructures();
    res.json({ success: true, message: 'Salary structures fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalaryStructure = async (req, res) => {
  try {
    const data = await payrollService.getSalaryStructure(req.params.employee_id);
    res.json({ success: true, message: 'Salary structure fetched.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const generatePayrun = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ success: false, message: 'Month and year required.' });
    const data = await payrollService.generatePayrun(parseInt(month), parseInt(year), req.user.id);
    res.json({ success: true, message: 'Payrun generated.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getAllPayruns = async (req, res) => {
  try {
    const data = await payrollService.getAllPayruns();
    res.json({ success: true, message: 'Payruns fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayrunPayslips = async (req, res) => {
  try {
    const data = await payrollService.getPayrunPayslips(req.params.id);
    res.json({ success: true, message: 'Payslips fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPayslips = async (req, res) => {
  try {
    const data = await payrollService.getMyPayslips(req.user.id);
    res.json({ success: true, message: 'My payslips fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayslipById = async (req, res) => {
  try {
    const data = await payrollService.getPayslipById(req.params.id);
    // Employees can only see their own
    if (req.user.role === 'employee' && data.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, message: 'Payslip fetched.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getPayslipPDF = async (req, res) => {
  try {
    // Check access
    const payslip = await payrollService.getPayslipById(req.params.id);
    if (req.user.role === 'employee' && payslip.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { doc, payslip: ps } = await payrollService.generatePayslipPDF(req.params.id);
    const monthName = payrollService.monthNames[ps.month - 1];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip_${monthName}_${ps.year}.pdf`);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const finalizePayrun = async (req, res) => {
  try {
    const data = await payrollService.finalizePayrun(req.params.id);
    res.json({ success: true, message: 'Payrun finalized.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  upsertSalaryStructure, getAllSalaryStructures, getSalaryStructure,
  generatePayrun, getAllPayruns, getPayrunPayslips, getMyPayslips,
  getPayslipById, getPayslipPDF, finalizePayrun,
};
