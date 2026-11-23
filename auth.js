const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const router = express.Router();

router.post('/signup', function(req, res){
    
const username = req.body.username;
const email = req.body.email;
const password = req.body.password;

// All three must be text
 if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string'){
    return res.status(400).send({ error: 'username, email, and password are required' });
 }
 
 // Username: 3-20 letters, numbers, or underscoress
 if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).send({ error: 'Username must be 3-20 letters, numbers, or underscores'});
 }

 // Email: something@something.something, and not absurdly long
 if(email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return res.status(400).send({ error: 'Please enter a valid email address' });
 }

 // Password: at least 8 characters, at most 72 (bcrypt's limit)
 if (password.length < 8 || password.length > 72){
    return res.status(400).send({ error: 'Password must be 8-72 characters' });
 }


bcrypt.hash(password, 10, function(err, hashedPassword){

    

    db.run('INSERT INTO users (username, email, password) VALUES (?,?,?)', [username,email, hashedPassword],
        function(err){
            if (err) {
                console.error('SIGNUP ERROR:', err.message);
            if (err.message.includes('UNIQUE')){
                return res.status(409).send({ error: 'an account with that email or username already exists' });
            }
                return res.status(500).send({error: 'internal server error'});
            }
            res.status(201).send({ message: 'user created successfully' });
        }
    );

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

router.get('/me', function(req, res){
    if (!req.session.user) {
        return res.json({ user: null });
    }
    res.json({ user: req.session.user });
});

router.post('/logout', function(req, res){

req.session.destroy(function(err){
    if(err) {
        console.error('LOGOUT ERROR:', err.message);
        return res.status(500).send({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.send({ message: 'logout successful' });
});
});


module.exports = router;
