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

router.post('/login', function (req, res) {
const email = req.body.email;
const password = req.body.password;

db.get('SELECT * FROM users WHERE email = ?', [email], function(err, user){

    if (!user) {
        return res.status(401).send({ error: 'invalid email or password'});
    }

    bcrypt.compare(password, user.password, function(err, passwordMatches){

    if (!passwordMatches) {
        return res.status(401).send({ error : 'invalid email or password'}); 

    }

    req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    res.send({ message: 'login successful', userId: user.id, username: user.username });

    
    
    

});
});
});


module.exports = router;
