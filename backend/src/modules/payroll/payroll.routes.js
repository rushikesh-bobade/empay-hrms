const express = require('express');
const router = express.Router();
const payrollController = require('./payroll.controller');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// Salary Structures
router.post('/salary-structure', auth, roleGuard(['admin', 'payroll_officer']), payrollController.upsertSalaryStructure);
router.get('/salary-structure', auth, roleGuard(['admin', 'payroll_officer']), payrollController.getAllSalaryStructures);
router.get('/salary-structure/:employee_id', auth, roleGuard(['admin', 'payroll_officer']), payrollController.getSalaryStructure);

// Payruns
router.post('/payrun/generate', auth, roleGuard(['admin', 'payroll_officer']), payrollController.generatePayrun);
router.get('/payruns', auth, roleGuard(['admin', 'payroll_officer']), payrollController.getAllPayruns);
router.get('/payruns/:id/payslips', auth, roleGuard(['admin', 'payroll_officer']), payrollController.getPayrunPayslips);
router.patch('/payruns/:id/finalize', auth, roleGuard(['admin', 'payroll_officer']), payrollController.finalizePayrun);

// Payslips
router.get('/payslips/my', auth, payrollController.getMyPayslips);
router.get('/payslips/:id', auth, payrollController.getPayslipById);
router.get('/payslips/:id/pdf', auth, payrollController.getPayslipPDF);

module.exports = router;
