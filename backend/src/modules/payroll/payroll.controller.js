const payrollService = require('./payroll.service');

const upsertSalaryStructure = async (req, res) => {
  try {
    const data = await payrollService.upsertSalaryStructure(req.body);
    res.json({ success: true, message: 'Salary structure saved', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getAllSalaryStructures = async (req, res) => {
  try {
    const data = await payrollService.getAllSalaryStructures();
    res.json({ success: true, message: 'Salary structures fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getSalaryStructure = async (req, res) => {
  try {
    const data = await payrollService.getSalaryStructure(parseInt(req.params.employee_id, 10));
    res.json({ success: true, message: 'Salary structure fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const generatePayrun = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }
    const data = await payrollService.generatePayrun(parseInt(month), parseInt(year), req.user.id);
    res.json({ success: true, message: 'Payrun generated successfully', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getPayruns = async (req, res) => {
  try {
    const data = await payrollService.getPayruns();
    res.json({ success: true, message: 'Payruns fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getPayrunPayslips = async (req, res) => {
  try {
    const data = await payrollService.getPayrunPayslips(req.params.id);
    res.json({ success: true, message: 'Payslips fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getMyPayslips = async (req, res) => {
  try {
    const data = await payrollService.getMyPayslips(req.user.id);
    res.json({ success: true, message: 'Payslips fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getPayslipById = async (req, res) => {
  try {
    const data = await payrollService.getPayslipById(req.params.id);
    // Check if employee can access own payslip only
    if (req.user.role === 'employee' && data.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, message: 'Payslip fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getPayslipPDF = async (req, res) => {
  try {
    // Check access
    const payslip = await payrollService.getPayslipById(req.params.id);
    if (req.user.role === 'employee' && payslip.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { doc, filename } = await payrollService.generatePayslipPDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  upsertSalaryStructure, getAllSalaryStructures, getSalaryStructure,
  generatePayrun, getPayruns, getPayrunPayslips,
  getMyPayslips, getPayslipById, getPayslipPDF,
};
