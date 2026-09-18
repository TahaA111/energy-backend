const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const router = express.Router();

router.post('/signup', function(req, res){
const username = req.body.username;
const email = req.body.email;
const password = req.body.password;


bcrypt.hash(password, 10, function(err, hashedPassword){

    db.run('INSERT INTO users (username, email, password) VALUES (?,?,?)', [username,email, hashedPassword]);
    res.send('User data recieved');

});

});

module.exports = router;



