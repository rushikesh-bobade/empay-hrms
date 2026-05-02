const express = require('express');
const router = express.Router();
const payrollController = require('./payroll.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(authMiddleware);

// Salary Structures
router.post('/salary-structure', roleGuard(['admin', 'payroll_officer']), payrollController.upsertSalaryStructure);
router.get('/salary-structure', roleGuard(['admin', 'payroll_officer']), payrollController.getAllSalaryStructures);
router.get('/salary-structure/:employee_id', roleGuard(['admin', 'payroll_officer']), payrollController.getSalaryStructure);

// Payruns
router.post('/payrun/generate', roleGuard(['payroll_officer']), payrollController.generatePayrun);
router.get('/payruns', roleGuard(['admin', 'payroll_officer']), payrollController.getPayruns);
router.get('/payruns/:id/payslips', roleGuard(['admin', 'payroll_officer']), payrollController.getPayrunPayslips);

// Payslips
router.get('/payslips/my', payrollController.getMyPayslips);
router.get('/payslips/:id', payrollController.getPayslipById);
router.get('/payslips/:id/pdf', payrollController.getPayslipPDF);

module.exports = router;
