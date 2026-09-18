//this loads dotenv 
require('dotenv').config();


// This gives me access to the express library
const express = require('express');

const cors = require('cors');

// This gives me access to the shared db connection built in db.js
const db = require('./db');

// This gives me access to the signup/login routes built in auth.js
const authRoutes = require('./auth');

// This creates an express object for me to use
const app = express();

// This translates incoming JSON text into a usable object on req.body
app.use(express.json());
app.use(cors());

// Every route inside auth.js is now reachable under /auth
// (so /auth/signup and /auth/login)
app.use('/auth', authRoutes);

// app.get handles someone visiting the root page and replies with a message that the server is running
app.get('/', function(req, res) {
  res.send('Hello, server is running!');
});

app.post('/cost', function(req, res){

  const url = 'https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=' + process.env.EIA_API_KEY + '&frequency=monthly&data[]=price&facets[stateid][]=CA&facets[sectorid][]=RES&sort[0][column]=period&sort[0][direction]=desc&length=1';

  fetch (url)
    .then(function(res2){ return res2.json(); })
    .then(function(data){
        let price = Number(data.response.data[0].price);
        let pricePerKwhInDollars = price / 100 ;
        let cost = req.body.total * pricePerKwhInDollars;
        cost = Math.round(cost * 100) / 100;

        res.send({ cost : cost });
    });


});

// app.post handles a single reading being sent to /readings, inserts it, and replies that it was received
app.post('/readings', function(req, res) {
  for (let i = 0; i < req.body.length; i++){
  db.run('INSERT INTO readings (date, kwh) VALUES (?,?)', [req.body[i].date, req.body[i].kwh]);
  }
  res.send('Batch received');
});

// app.post handles a summary being sent to /summaries, inserts it, and replies that it was received
app.post('/summaries', function(req, res) {
  db.run('INSERT INTO summaries (total, average, min, max, cost) VALUES (?,?,?,?,?)', [req.body.total, req.body.average, req.body.min, req.body.max, req.body.cost], function(err) {
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