import db from './database.js';

async function makeGoogleAccountAdmin() {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    const targetEmail = 'vinque.sys@gmail.com';
    console.log(`🔍 Looking for Google account: ${targetEmail}`);
    
    // First, check if the user exists in customer_tb or seller_tb
    const [customerCheck] = await connection.query(
      'SELECT user_id, First_name, Last_name FROM customer_tb WHERE email = ?',
      [targetEmail]
    );
    
    const [sellerCheck] = await connection.query(
      'SELECT user_id, First_name, Last_name FROM seller_tb WHERE email = ?',
      [targetEmail]
    );
    
    let userId = null;
    let firstName = '';
    let lastName = '';
    
    if (customerCheck.length > 0) {
      userId = customerCheck[0].user_id;
      firstName = customerCheck[0].First_name;
      lastName = customerCheck[0].Last_name;
      console.log(`✅ Found customer account: ${firstName} ${lastName} (ID: ${userId})`);
    } else if (sellerCheck.length > 0) {
      userId = sellerCheck[0].user_id;
      firstName = sellerCheck[0].First_name;
      lastName = sellerCheck[0].Last_name;
      console.log(`✅ Found seller account: ${firstName} ${lastName} (ID: ${userId})`);
    } else {
      console.log(`❌ No account found for ${targetEmail}`);
      console.log('📝 You need to sign up with this Google account first!');
      return;
    }
    
    // Check current role in accounts table
    const [accountCheck] = await connection.query(
      'SELECT username, role FROM accounts WHERE user_id = ?',
      [userId]
    );
    
    if (accountCheck.length === 0) {
      console.log(`❌ No account record found for user ID ${userId}`);
      return;
    }
    
    const currentRole = accountCheck[0].role;
    console.log(`📋 Current role: ${currentRole}`);
    
    if (currentRole === 'Admin') {
      console.log('✅ Account is already an Admin!');
      return;
    }
    
    // Update role to Admin
    const [updateResult] = await connection.query(
      'UPDATE accounts SET role = "Admin" WHERE user_id = ?',
      [userId]
    );
    
    if (updateResult.affectedRows > 0) {
      await connection.commit();
      console.log(`🎉 Successfully updated ${targetEmail} to Admin role!`);
      console.log(`👤 User: ${firstName} ${lastName}`);
      console.log(`🆔 User ID: ${userId}`);
      console.log(`🔄 Role changed from: ${currentRole} → Admin`);
    } else {
      console.log('❌ Failed to update role');
    }
    
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('❌ Error:', err);
  } finally {
    if (connection) connection.release();
  }
  process.exit();
}

makeGoogleAccountAdmin();