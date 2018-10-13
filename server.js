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

// simple REST API for Here.com, no need for fancy libraries
const http = require('http');

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
  if(!req.session.uid) return res.send(false);

  let title = req.body.title;
  let keywords = req.body.keywords;
  let subject = req.body.subject;
  let course = req.body.course;
  let location = req.body.location;
  let body = req.body.body;

  // geocoding
  geocode(encodeURIComponent(location), data => {
    let lat = data.Latitude;
    let lng = data.Longitude;
    let geo = { lat: lat, lng: lng };

    let geo_db = {
      loc: location,
      geo: lat
    };

    db.oneOrNone('insert into posts (title, keywords, subject, course, body, uid, location) values ($1, $2, $3, $4, $5, $6, $7) returning id', [title, keywords, subject, course, body, req.session.uid, JSON.stringify(geo_db)])
        .then(data => {
        // send to algolia
        let aobject = [{
          objectID: data.id,
          keywords: keywords,
          title: title,
          votes: 0,
          subject: subject,
          course: course,
          _geoloc: geo
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

// query
app.post('/query', function(req, res) {
  let query = req.body.query;
  let filters = req.body.filters;
  let geo_filter = req.body.geo_filter;
  let data_obj = { query: query, filters: filters };
  if(geo_filter != -1) {
    data_obj.aroundLatLng = geo_filter;
    data_obj.aroundRadius = 150000;
  }
  aindex.search(data_obj, (err, data) => {
    if(err) {
      console.log(err);
      return res.send(false);
    }

    res.send(data);
  });
});

// REST API for Here.com
// API request from https://stackoverflow.com/a/5643366/2397327
let geocode = (address, cb) => {
  var options = {
    host: 'geocoder.api.here.com',
    port: 80,
    path: `/6.2/geocode.json?app_id=${process.env.HERE_APPLICATION_ID}&app_code=${process.env.HERE_APPLICATION_CODE}&searchtext=${address}`,
    method: 'GET'
  };
  console.log(options.host + options.path);
  http.request(options, function(res2) {
    res2.setEncoding('utf8');
    let total = '';
    res2.on('data', function (chunk) {
      total += chunk;
    });
    res2.on('end', function() {
      total = JSON.parse(total);

      // send coordinates back
      if(total.Response == undefined || total.Response.View.length == 0)
        cb(null);
      else
        cb(total.Response.View[0].Result[0].Location.DisplayPosition);
    });
  }).end();
};

// upvotes and downvotes
app.post('/upvote', function(req, res) {
  let pid = req.body.pid;

  db.one('select votes from posts where id=$1', [pid])
    .then(data => {
      data = JSON.parse(data.votes);
      data.up.push(null);

      let votes = data.up.length - data.down.length;

      data = JSON.stringify(data);
      
      db.none('update posts set votes=$1 where id=$2', [data,pid])
        .catch(err => {
          console.log(err);
          res(false);
        })

      let aobject = [{
        objectID: data.pid,
        votes: votes
      }];

      aindex.partialUpdateObject(aobject, _=>_);

      res.send(true);
    })
    .catch(err => {
      console.log(err);
      res.send(false);
    });
});
// copied from above except moved down instead of up
app.post('/downvote', function(req, res) {
  let pid = req.body.pid;

  db.one('select votes from posts where id=$1', [pid])
    .then(data => {
      data = JSON.parse(data.votes);
      data.down.push(null);

      let votes = data.up.length - data.down.length;

      data = JSON.stringify(data);
      
      db.none('update posts set votes=$1 where id=$2', [data,pid])
        .catch(err => {
          console.log(err);
          res(false);
        })

      let aobject = [{
        objectID: data.pid,
        votes: votes
      }];

      aindex.partialUpdateObject(aobject, _=>_);

      res.send(true);
    })
    .catch(err => {
      console.log(err);
      res.send(false);
    });
});

// statically host files in public folder
app.use(express.static('./public/'));
app.listen(process.env.PORT || 5000);
