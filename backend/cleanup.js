require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("DELETE FROM notifications WHERE title LIKE '%Absentee%'")
  .then(r => { console.log('Deleted', r.rowCount, 'absentee notifications'); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
