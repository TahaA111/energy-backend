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

function requireLogin(req,res, next){
  if (!req.session.user) {
      return res.status(401).send({ error: 'you must be logged in'})
  }
  next();
}


const session = require('express-session');

// This translates incoming JSON text into a usable object on req.body
app.use(express.json());
app.use(cors({

  origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:5501'],
  credentials: true

}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

}));

// app.get handles reading back every saved reading from the database

app.get('/readings', requireLogin, function(req, res){

  db.all('SELECT * FROM readings WHERE user_id = ?', [req.session.user.id], function(err, rows){
    res.send(rows);
  });
});

// Every route inside auth.js is now reachable under /auth
// (so /auth/signup and /auth/login)
app.use('/auth', authRoutes);




// app.get handles someone visiting the root page and replies with a message that the server is running
app.get('/', function(req, res) {
  res.send('Hello, server is running!');
});

app.post('/cost', requireLogin, function(req, res){

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
app.post('/readings', requireLogin, function(req, res) {
  for (let i = 0; i < req.body.length; i++){
  db.run('INSERT INTO readings (date, kwh, user_id) VALUES (?,?,?)', [req.body[i].date, req.body[i].kwh, req.session.user.id]);
  }
  res.send('Batch received');
});

// app.post handles a summary being sent to /summaries, inserts it, and replies that it was received
app.post('/summaries', requireLogin, function(req, res) {
  db.run('INSERT INTO summaries (total, average, min, max, cost, user_id) VALUES (?,?,?,?,?,?)', [req.body.total, req.body.average, req.body.min, req.body.max, req.body.cost, req.session.user.id], function(err) {
    if (err) {
      console.log('INSERT ERROR:', err.message);
      res.status(500).send({ error: 'Failed to save summary' });
    } else {
      console.log('INSERT SUCCESS, row id:', this.lastID);
      res.send({ message: 'Summary received', summaryID: this.lastID });
    }
  });
});



// app.listen is what actually starts the server, and the callback confirms it's running with no errors
app.listen(3000, function() {
  console.log('Server is running on port 3000');
});


// app.get handles reading back every saved reading from the database
