const path = require('path');
const dbPath = path.join(process.cwd(), 'lib', 'db.js');
console.log('DB Path:', dbPath);

try {
  const db = require(dbPath);
  console.log('DB Module:', Object.keys(db));
} catch (error) {
  console.error('Error:', error.message);
}
