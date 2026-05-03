const { pool } = require('../../config/db');

class SettingsService {
  async getAll() {
    const result = await pool.query(`SELECT key, value FROM settings`);
    const settings = {};
    result.rows.forEach(row => {
      // Parse JSON values, fallback to raw value
      try {
        settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      } catch {
        settings[row.key] = row.value;
      }
    });
    return settings;
  }

  async update(settingsData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(settingsData)) {
        await client.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, JSON.stringify(value)]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return this.getAll();
  }

  async getDbStats() {
    const tables = ['users', 'attendance', 'leave_requests', 'leave_types', 'salary_structures', 'payruns', 'payslips', 'notifications', 'settings'];
    const stats = {};

    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = parseInt(res.rows[0].count);
      } catch {
        stats[table] = 0;
      }
    }

    // DB size
    try {
      const sizeRes = await pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
      stats.db_size = sizeRes.rows[0].size;
    } catch {
      stats.db_size = 'N/A';
    }

    // DB name and version
    try {
      const nameRes = await pool.query(`SELECT current_database() as name, version() as version`);
      stats.db_name = nameRes.rows[0].name;
      stats.db_version = nameRes.rows[0].version.split(' ').slice(0, 2).join(' ');
    } catch {
      stats.db_name = 'N/A';
      stats.db_version = 'N/A';
    }

    return stats;
  }
}

module.exports = new SettingsService();
