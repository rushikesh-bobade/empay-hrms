require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const admins = await pool.query("SELECT id, email, role, is_active FROM users WHERE role='admin'");
  console.log('=== ADMIN USERS ===');
  console.log(JSON.stringify(admins.rows, null, 2));
  
  const all = await pool.query("SELECT email, role FROM users ORDER BY role, email");
  console.log('\n=== ALL USERS ===');
  all.rows.forEach(r => console.log(`  ${r.role.padEnd(16)} ${r.email}`));
  
  // Test password for amit@empay.com
  const bcrypt = require('bcrypt');
  const amit = await pool.query("SELECT password_hash FROM users WHERE email='amit@empay.com'");
  if (amit.rows.length > 0) {
    const match = await bcrypt.compare('Password@123', amit.rows[0].password_hash);
    console.log('\namit@empay.com password "Password@123" match:', match);
  }
  
  await pool.end();
}
check().catch(e => { console.error(e); pool.end(); });
