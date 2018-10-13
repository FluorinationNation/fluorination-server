// require dependencies
// express for routing 
const express = require('express');
const app = express();
const session = require('express-session');
app.use(session({
  secret: 'secretysecret',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// for decoding POST data
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// for database
const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL + "?ssl=true");
// setting up database
// db.none('create table users (id serial primary key, username text unique, password text unique, location text, posts text, rep int, quality float)').catch(_=>_);

// for encrypting passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

// sign up a user
app.post('/sign_up', async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let location = req.body.location;

  // simple validation here
  let password_hash = await bcrypt.hash(password, saltRounds);
  db.oneOrNone('insert into users (username, password, location) values($1, $2, $3) returning id', [username, password_hash, location])
    .then(id => {
      req.session.userId = id;
      res.send(true);
    })
    .catch(err => {
      console.log(err)
      res.send(false);
    });
});

// sign in a user
app.post('/sign_in', async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  // simple validation
  db.oneOrNone('select password, id from users where username=$1', [username])
    .then(async data => {
      if(data == null)
        return res.send(false);

      let password_match = await bcrypt.compare(password, data.password);
      if(password_match) {
        req.session.userId = data.id;
        res.send(true);
      } else {
        res.send(false);
      }
    })
    .catch(err => {
      console.log(err);
      res.send(false);
    });
});

// get user details
app.post('/get_username', function(req, res) {
  if(req.session.userId == undefined) return res.send(null);

  db.oneOrNone('select username from users where id=$1', [req.session.userId])
    .then(data => {
      if(data == null) return res.send(null);
      
      res.send(data.username);
    })
    .catch(err => {
      console.log(err);
      res.send(null);
    })
});

// sign out
app.post('/sign_out', function(req, res) {
  req.session.regenerate(_ => {
    res.send(null);
  });
});

// statically host files in public folder
app.use(express.static('./public/'));
app.listen(process.env.PORT || 5000);
