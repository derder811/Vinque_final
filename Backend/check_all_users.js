import db from './database.js';

async function checkAllUsers() {
  try {
    // Get all users from accounts table
    const [users] = await db.query('SELECT user_id, username, role FROM accounts ORDER BY user_id');
    console.log('\nAll users in the system:');
    console.table(users);
    
    // Check for admin users specifically
    const [admins] = await db.query('SELECT user_id, username, role FROM accounts WHERE role = "Admin"');
    console.log('\nAdmin users:');
    console.table(admins);
    
    // Check for Google users (users with null password)
    const [googleUsers] = await db.query('SELECT user_id, username, role FROM accounts WHERE password IS NULL');
    console.log('\nGoogle OAuth users:');
    console.table(googleUsers);
    
  } catch (err) {
    console.error('❌ Database error:', err);
  }
  process.exit();
}

checkAllUsers();