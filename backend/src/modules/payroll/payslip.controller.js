const bulkExport = async (req, res) => {
  try {
    const { employee_ids, month, year } = req.body;
    if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'employee_ids must be a non-empty array' });
    }
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    res.json({
      success: true,
      message: 'Bulk export initiated',
      data: {
        employee_ids,
        month,
        year,
        total_employees: employee_ids.length,
        placeholder: true,
        note: 'Full implementation will generate and return a ZIP archive of payslips.',
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = { bulkExport };
