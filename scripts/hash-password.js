const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('\nCopy hash di atas dan gunakan di Supabase atau saat membuat admin baru.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Jalankan: node scripts/hash-password.js password_yang_ingin_di_hash
const password = process.argv[2] || 'admin123';
hashPassword(password);
