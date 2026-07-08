process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

const { calcUnpaidDeduction, buildPayslip } = require('../src/config/db');

describe('calcUnpaidDeduction', () => {
  it('should calculate deduction correctly', () => {
    expect(calcUnpaidDeduction(30000, 22, 2)).toBe(2727.27);
  });

  it('should return 0 for zero unpaid leave days', () => {
    expect(calcUnpaidDeduction(30000, 22, 0)).toBe(0);
  });

  it('should throw for zero working days', () => {
    expect(() => calcUnpaidDeduction(30000, 0, 2)).toThrow('workingDays must be > 0');
  });

  it('should throw for negative unpaid leave days', () => {
    expect(() => calcUnpaidDeduction(30000, 22, -1)).toThrow('unpaidLeaveDays must be >= 0');
  });

  it('should throw when unpaid leave days exceed working days', () => {
    expect(() => calcUnpaidDeduction(30000, 22, 30)).toThrow('unpaidLeaveDays cannot exceed workingDays');
  });

  it('should handle zero basic salary', () => {
    expect(calcUnpaidDeduction(0, 22, 2)).toBe(0);
  });
});

describe('buildPayslip', () => {
  it('should calculate a complete payslip correctly', () => {
    const result = buildPayslip({
      basicSalary: 30000,
      hraPercent: 40,
      specialAllowance: 2000,
      workingDays: 22,
      presentDays: 20,
      leavesApproved: 1,
      unpaidLeaveDays: 1,
    });

    const expectedUnpaidDeduction = calcUnpaidDeduction(30000, 22, 1);
    const expectedEffectiveBasic = 30000 - expectedUnpaidDeduction;
    const expectedHra = Math.round(expectedEffectiveBasic * 0.4 * 100) / 100;
    const expectedGross = Math.round((expectedEffectiveBasic + expectedHra + 2000) * 100) / 100;
    const expectedPf = Math.round(expectedEffectiveBasic * 0.12 * 100) / 100;
    const expectedPt = expectedGross > 15000 ? 200 : 0;
    const expectedTotalDeductions = Math.round((expectedPf + expectedPt + expectedUnpaidDeduction) * 100) / 100;
    const expectedNetPay = Math.max(0, Math.round((expectedGross - expectedTotalDeductions) * 100) / 100);

    expect(result.unpaid_deduction).toBe(expectedUnpaidDeduction);
    expect(result.basic).toBe(expectedEffectiveBasic);
    expect(result.hra).toBe(expectedHra);
    expect(result.gross_salary).toBe(expectedGross);
    expect(result.pf_employee).toBe(expectedPf);
    expect(result.pf_employer).toBe(expectedPf);
    expect(result.professional_tax).toBe(200);
    expect(result.total_deductions).toBe(expectedTotalDeductions);
    expect(result.net_pay).toBe(expectedNetPay);
  });

  it('should calculate PF correctly as 12% of effective basic', () => {
    const result = buildPayslip({
      basicSalary: 50000,
      hraPercent: 40,
      specialAllowance: 0,
      workingDays: 22,
      presentDays: 22,
      leavesApproved: 0,
      unpaidLeaveDays: 0,
    });

    expect(result.pf_employee).toBe(6000);
    expect(result.pf_employer).toBe(6000);
  });

  it('should apply professional tax only for gross > 15000', () => {
    const low = buildPayslip({
      basicSalary: 10000,
      hraPercent: 40,
      specialAllowance: 0,
      workingDays: 22,
      presentDays: 22,
      leavesApproved: 0,
      unpaidLeaveDays: 0,
    });

    expect(low.professional_tax).toBe(0);

    const high = buildPayslip({
      basicSalary: 30000,
      hraPercent: 40,
      specialAllowance: 0,
      workingDays: 22,
      presentDays: 22,
      leavesApproved: 0,
      unpaidLeaveDays: 0,
    });

    expect(high.professional_tax).toBe(200);
  });

  it('should handle zero salary edge case', () => {
    const result = buildPayslip({
      basicSalary: 0,
      hraPercent: 40,
      specialAllowance: 0,
      workingDays: 22,
      presentDays: 0,
      leavesApproved: 0,
      unpaidLeaveDays: 0,
    });

    expect(result.basic).toBe(0);
    expect(result.hra).toBe(0);
    expect(result.gross_salary).toBe(0);
    expect(result.pf_employee).toBe(0);
    expect(result.professional_tax).toBe(0);
    expect(result.total_deductions).toBe(0);
    expect(result.net_pay).toBe(0);
  });

  it('should handle max unpaid leave days (all days unpaid)', () => {
    const result = buildPayslip({
      basicSalary: 30000,
      hraPercent: 40,
      specialAllowance: 1000,
      workingDays: 22,
      presentDays: 0,
      leavesApproved: 0,
      unpaidLeaveDays: 22,
    });

    expect(result.unpaid_leave_days).toBe(22);
    expect(result.net_pay).toBe(0);
  });

  it('should ensure net pay is never negative', () => {
    const result = buildPayslip({
      basicSalary: 1000,
      hraPercent: 40,
      specialAllowance: 0,
      workingDays: 22,
      presentDays: 1,
      leavesApproved: 0,
      unpaidLeaveDays: 21,
    });

    expect(result.net_pay).toBeGreaterThanOrEqual(0);
  });
});
