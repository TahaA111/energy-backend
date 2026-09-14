// This gives me access to the express library
const express = require('express');

// This gives me access to the sqlite3 library
const sqlite3 = require('sqlite3');

const cors = require('cors');


// This creates an express object for me to use
const app = express();

const fs = require('fs');
const schema = fs.readFileSync('db.sql', 'utf8');

// This translates incoming JSON text into a usable object on req.body
app.use(express.json());
app.use(cors());

// This creates (or connects to) the database through the sqlite3 library
const db = new sqlite3.Database('energy.db');

// Runs the full schema file (both CREATE TABLE statements) against the database
db.exec(schema);

// app.get handles someone visiting the root page and replies with a message that the server is running
app.get('/', function(req, res) {
  res.send('Hello, server is running!');
});

// app.post handles a single reading being sent to /readings, inserts it, and replies that it was received
app.post('/readings', function(req, res) {
  db.run('INSERT INTO readings (date, kwh) VALUES (?,?)', [req.body.date, req.body.kwh]);
  res.send('Data received');
});

// app.post handles a summary being sent to /summaries, inserts it, and replies that it was received
app.post('/summaries', function(req, res) {
  db.run('INSERT INTO summaries (total, average, min, max) VALUES (?,?,?,?)', [req.body.total, req.body.average, req.body.min, req.body.max], function(err) {
    if (err) {
      console.log('INSERT ERROR:', err.message);
    } else {
      console.log('INSERT SUCCESS, row id:', this.lastID);
    }
  });
});

// app.get handles reading back every saved reading from the database
app.get('/readings', function(req, res) {
  db.all('SELECT * FROM readings', function(err, rows) {
    res.send(rows);
  });
});

// app.listen is what actually starts the server, and the callback confirms it's running with no errors
app.listen(3000, function() {
  console.log('Server is running on port 3000');
});