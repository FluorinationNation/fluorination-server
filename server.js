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
//db.none('drop table users');
//db.none('drop table posts');
//db.none('create table users (id serial primary key, username text unique, password text, location text default \'\', posts text default \'{}\', rep int default 0, quality float default 0)');
//db.none('create table posts (id serial primary key, title text unique, keywords text, tags text, body text, votes text default \'{"up":[],"down":[]}\', location text default \'\', uid int, subject int, course int)');
//db.none('create table subjects (id serial primary key, name text unique, courses text)');
//db.none('create table courses (id serial primary key, name text, sid int)');

// for encrypting passwords
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// for angolia search
const asearch = require('algoliasearch');
const aclient = asearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_API_KEY);
const aindex = aclient.initIndex('fluorination');

// sign up a user
app.post('/sign_up', async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let location = req.body.location;

  // simple validation here
  let password_hash = await bcrypt.hash(password, saltRounds);
  db.oneOrNone('insert into users (username, password, location) values($1, $2, $3) returning id', [username, password_hash, location])
    .then(data => {
      req.session.uid = data.id;
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
        req.session.uid = data.id;
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

// get user data
app.post('/get_userdata', function(req, res) {
  if(req.session.uid == undefined) return res.send(null);

  db.oneOrNone('select username from users where id=$1', [req.session.uid])
    .then(data => {
      if(data == null) return res.send(null);
      
      res.send({
        username: data.username,
        id: req.session.uid
      });
    })
    .catch(err => {
      console.log(err);
      res.send(null);
    })
});

// get user name from id
app.post('/get_username', function(req, res) {
  if(req.body.uid == undefined) return res.send(null);

  db.oneOrNone('select username from users where id=$1', [req.body.uid])
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

// insert knowledge into the database
app.post('/add_knowledge', function(req, res) {
  let title = req.body.title;
  let keywords = req.body.keywords;
  let subject = req.body.subject;
  let course = req.body.course;
  let location = req.body.location;
  let body = req.body.body;

  db.oneOrNone('insert into posts (title, keywords, subject, course, body) values ($1, $2, $3, $4, $5) returning id', [title, keywords, subject, course, body])
    .then(data => {
      // send to algolia
      let aobject = [{
        objectID: data.id,
        keywords: keywords,
        title: title,
        votes: 0,
        subject: subject,
        course: course,
        location: location
      }];
      aindex.addObjects(aobject, (err, content) => {
        console.log(content);
      });

      res.send({id: data.id});
    })
    .catch(err => {
      console.log(err);
      res.send(false);
    });
});

// get post data
app.post('/get_post', function(req, res) {
  let pid = req.body.pid;
  db.oneOrNone('select title, keywords, subject, course, body, votes, location, uid from posts where id=$1', pid)
    .then(async data => {
      if(data == null)
        return res.send(false);

      // parse data
      // data.title = data.title
      data.keywords = data.keywords.split(',');
      data.subject = await db.one('select name, id from subjects where id=$1', [data.subject]);
      data.course = await db.one('select name, id from courses where id=$1', [data.course]);
      // data.body = data.body
      data.votes = JSON.parse(data.votes);
      // data.location = data.location
      data.uid = await db.one('select username, id from users where id=$1', [data.uid]);
      res.send(data);
    })
    .catch(err => {
      res.send(false);
      console.log(err);
    });
});

// statically host files in public folder
app.use(express.static('./public/'));
app.listen(process.env.PORT || 5000);
