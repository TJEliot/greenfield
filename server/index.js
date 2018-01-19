const flash = require('flash');
const express = require('express');
const helpers = ('./helpers.js');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const Model = require('../model2.js');
const User = Model.User;
const request = require('request');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const $ = require('jquery')
//const config = require('./config.js');
const app = express();
const MEETUPS_API_KEY = process.env.MEETINGS_API_KEY;

require('../passport.js')(passport);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'haha', name: 'session_id', saveUninitialized: true, resave: true, cookie: {
  maxAge: 2419200000 }}));
app.use(flash());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', express.static(__dirname + '/../client/dist'));
app.use('/login', express.static(__dirname + '/../client/dist'));
app.use('/logout', express.static(__dirname + '/../client/dist'));
app.use('/signup', express.static(__dirname + '/../client/dist'));
app.use('/home', express.static(__dirname + '/../client/dist'));
app.use('/profile', express.static(__dirname + '/../client/dist'));
app.get('/home', function(req, res){
  if(req.isAuthenticated()){
    next();
  }
  res.send({redirect: '/login'})
})
app.get('/users', function(req, res){
  console.log(req.user.local)
  res.send(req.user.local)
});
app.get('/profile', function(req, res){
  if(req.isAuthenticated()){
    next();
  }
  res.send({redirect: '/login'})
})
app.get('/session', function(req, res){
  if(!req.isAuthenticated()){
  res.send({redirect: '/login'});
 } else {
   res.send({redirect: '/home'});
 }
});
const getMeetupsByLatLon = (lat, lon, callback) => {
  console.log(`we are looking up the meetups near ${lat} and ${lon}`);
  var options = {url : `http://api.meetup.com//find/upcoming_events?\
    photo-host=public&fields=group_photo&page=20&key=${MEETUPS_API_KEY}&lat=${lat}&lon=${lon}&radius=1`,
    headers: {'User-Agent': 'request'}
  };
  request(options, (err, response, body) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, body);
    }
  })

};
const getLatLon = (zipcode, callback) => {
  var options = {
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}`,
    headers: {
      'User-Agent': 'request'
    }
  };
  request(options, (err, response, body) => {
    if (err) {
      callback(err, null);
    } else {
      var place = JSON.parse(body);
      var lat = place.results[0].geometry.location.lat;
      var lon = place.results[0].geometry.location.lng;
      callback(null, lat, lon);
    }
  })
}
app.post('/auth',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true }));
app.get('/meetups', function(req, res){
  console.log(req.sessionID)
  let sessionID = req.sessionID;
  var zipcode = req.param('zipcode');
  var lat = req.param('lat');
  var lon = req.param('lon');
  if (zipcode) {
    getLatLon(zipcode, (err, lat, lon) => {
      if (err) {
        res.send(err);
      }
      getMeetupsByLatLon(lat, lon, (error, meetups) => {
        if (error) {
          res.status(500).json(error);
        }
        res.json(meetups);
      });
     });
  } else {
    getMeetupsByLatLon(lat, lon, (error, meetups) => {
        if (error) {
          res.status(500).json(error);
        }
        res.json(meetups);
      });
    };
});
app.post('/signup', function(req, res, next) {
    var user = req.body;
    console.log('test', user)
    var usernamePromise = new Model.User({ username: user.username }).fetch();
    return usernamePromise.then(function(model) {
        if (model) {
            res.render('signup', { title: 'signup', errorMessage: 'username already exists' });
        } else {
            var email = user.email
            var password = user.password;
            var hash = bcrypt.hashSync(password, 10);
            let sessionID = req.sessionID;
            var createdAt = function() { return new Date(); }
            var signUpUser = new Model.User({
              username: user.username,
              password: hash,
              email: email,
              name: user.name,
              // created_at: createdAt(),
              session_id: sessionID,
              // biography: user.biography,
              // location: user.location,
              // age: user.age,
            });
            signUpUser.save({}, {method: 'insert'}).then(function(model) {
                res.redirect('/login');
            });
        }
    });
});
app.post('/logout', function(req, res){
  res.setHeader("Content-Type", "text/html");
  req.logout();
  req.session.destroy();
  res.send({redirect: '/'});
});

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, function(){
//   console.log('listening on port 3000!')
// });



var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
app.listen(server_port, function() {
    console.log(`Listening on port ${server_port}`);
});
