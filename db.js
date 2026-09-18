const sqlite3 = require('sqlite3');
const fs = require('fs');

const db = new sqlite3.Database('energy.db');

const schema = fs.readFileSync('db.sql', 'utf8');
db.exec(schema);

// This handles the case where a column was added to db.sql after the
// table already existed. SQLite has no "ADD COLUMN IF NOT EXISTS",
// so we run it manually and just ignore the "duplicate column" error
// on every restart after the first.
db.run('ALTER TABLE summaries ADD COLUMN cost REAL', function(err) {
  if (err && !err.message.includes('duplicate column')) {
    console.log('ALTER ERROR:', err.message);
  }
});

module.exports = db;