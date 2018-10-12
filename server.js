// require dependencies
// express for routing 
const express = require('express');
const app = express();

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

// receive data
app.post('/sign_up', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let location = req.body.location;

  // simple validation here
  db.none('insert into users (username, password, location) values($1, $2, $3) returning id', [username, password, location])
    .then(id => {
      console.log(id);
    })
    .catch(err => console.log(err));
});

// statically host files in public folder
app.use(express.static('./public/'));
app.listen(process.env.PORT || 5000);
