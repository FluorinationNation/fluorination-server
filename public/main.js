// wrapper
;(function() {

  // server
  let Server = {
    send_request(action, data, cb) {
      let xhr = new XMLHttpRequest();
      xhr.onload = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200)
          cb(this.response);
      };
      xhr.open('POST', '/' + action, true);
      
      // send data as param list
      let params = [];
      for(let param of Object.keys(data))
        params.push(param + '=' + data[param]);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(params.join('&'));
    },
    sign_up(username, password, loc, cb) {
      this.send_request('sign_up', {
          username: username,
          password: password,
          location: loc
        }, cb);
    },
    sign_in(username, password, cb) {
      this.send_request('sign_in', {
          username: username,
          password: password
        }, cb);
    },
    get_userdata(cb) {
      this.send_request('get_userdata', {}, cb);
    },
    get_username(uid, cb) {
      this.send_request('get_username', { uid: uid }, cb);
    },
    sign_out(cb) {
      this.send_request('sign_out', {}, cb);
    },
    add_knowledge(title, keywords, subject, course, location, body, cb) {
      this.send_request('add_knowledge', {
        title: title,
        keywords: keywords,
        subject: subject,
        course: course,
        location: location,
        body: body
      }, cb);
    },
    get_post(pid, cb) {
      this.send_request('get_post', { pid: pid }, cb);
    },
    query(query, filters, geo_filter, cb) {
      let data_obj = { query: query, filters: filters, geo_filter: geo_filter };
      this.send_request('query', data_obj, cb);
    },
    upvote(pid, cb) {
      this.send_request('upvote', { pid: pid }, cb);
    },
    downvote(pid, cb) {
      this.send_request('downvote', { pid: pid }, cb);
    }
  };

  // sign in component
  let SignUpComponent = {
    template: `<div class='container' id='sign_up'>
  <div class='form-group'>
    <label for='username_input'>Username</label>
    <input
      class='form-control w-auto'
      type='text'
      ref='username_input'
      id='username_input'
      v-model='username'
      placeholder='johnny_appleseed'
      @keyup.enter='sign_up'>
  </div>
  <div class='form-group'>
    <label for='password_input'>Password</label>
    <input
      class='form-control w-auto'
      type='password'
      id='password_input'
      v-model='password'
      placeholder='⁎⁎⁎⁎⁎⁎'
      @keyup.enter='sign_up'>
  </div>
  <div class='form-group'>
    <label for='location_select'>Location</label>
    <select class='custom-select d-block w-auto' id='location_select' v-model='loc' @keyup.enter='sign_up'>
      <option value='-1'>Select a location</option>
      <option value='1'>Alabama</option>
      <option value='2'>Alaska</option>
      <option value='3'>Arizona</option>
      <option value='4'>Arkansas</option>
      <option value='5'>California</option>
      <option value='6'>Colorado</option>
      <option value='7'>Connecticut</option>
      <option value='8'>Delaware</option>
      <option value='9'>Florida</option>
      <option value='10'>Georgia</option>
      <option value='11'>Hawaii</option>
      <option value='12'>Idaho</option>
      <option value='13'>Illinois</option>
      <option value='14'>Indiana</option>
      <option value='15'>Iowa</option>
      <option value='16'>Kansas</option>
      <option value='17'>Kentucky</option>
      <option value='18'>Louisiana</option>
      <option value='19'>Maine</option>
      <option value='20'>Maryland</option>
      <option value='21'>Massachusetts</option>
      <option value='22'>Michigan</option>
      <option value='23'>Minnesota</option>
      <option value='24'>Mississippi</option>
      <option value='25'>Missouri</option>
      <option value='26'>Montana</option>
      <option value='27'>Nebraska</option>
      <option value='28'>Nevada</option>
      <option value='29'>New Hampshire</option>
      <option value='30'>New Jersey</option>
      <option value='31'>New Mexico</option>
      <option value='32'>New York</option>
      <option value='33'>North Carolina</option>
      <option value='34'>North Dakota</option>
      <option value='35'>Ohio</option>
      <option value='36'>Oklahoma</option>
      <option value='37'>Oregon</option>
      <option value='38'>Pennsylvania</option>
      <option value='39'>Rhode Island</option>
      <option value='40'>South Carolina</option>
      <option value='41'>South Dakota</option>
      <option value='42'>Tennessee</option>
      <option value='43'>Texas</option>
      <option value='44'>Utah</option>
      <option value='45'>Vermont</option>
      <option value='46'>Virginia</option>
      <option value='47'>Washington</option>
      <option value='48'>West Virginia</option>
      <option value='49'>Wisconsin</option>
      <option value='50'>Wyoming</option>
      <option value='0'>Other</option>
    </select>
  </div>
  <div>
    <button
      class='btn btn-primary w-auto'
      type='button'
      id='sign_up'
      @click='sign_up()'>Sign up</button>
  </div>
  <p class='mt-3'><a href @click='$emit("to-view", "search");$event.preventDefault()'>Return to search</a></p>
</div>`,
    data() {
      return {
        username: '',
        password: '',
        loc: -1
      };
    },
    methods: {
      sign_up() {
        Server.sign_up(this.username, this.password, this.loc, data => {
          if(data) {
            this.$emit('update-user');
            this.$emit('to-view', 'search');
          }
        });
      }
    },
    created() {
      Server.get_userdata(data => {
        if(data)
          this.$emit('to-view', 'search');
      });
    },
    mounted() {
      this.$refs.username_input.focus();
    }
  };

  // for signing in
  let SignInComponent = {
    template: `<div class='container' id='sign_in'>
  <div class='form-group'>
    <label for='username_input'>Username</label>
    <input
      class='form-control w-auto'
      type='text'
      ref='username_input'
      id='username_input'
      v-model='username'
      placeholder='bucky'
      @keyup.enter='sign_in'>
  </div>
  <div class='form-group'>
    <label for='password_input'>Password</label>
    <input
      class='form-control w-auto'
      type='password'
      id='password_input'
      v-model='password'
      placeholder='⁎⁎⁎⁎⁎⁎'
      @keyup.enter='sign_in'>
  </div>
  <div>
    <button class='btn btn-primary w-auto' @click='sign_in'>Sign in</button>
  </div>
  <p class='mt-3'><a href @click='$emit("to-view", "search");$event.preventDefault()'>Return to search</a></p>
</div>`,
    data() {
      return {
        username: '',
        password: ''
      };
    },
    methods:  {
      sign_in() {
        Server.sign_in(this.username, this.password, data => {
          if(data) {
            this.$emit('update-user');
            this.$emit('to-view', 'search');
          }
        });
      }
    },
    created() {
      Server.get_userdata(data => {
        if(data)
          this.$emit('to-view', 'search');
      });
    },
    mounted() {
      this.$refs.username_input.focus();
    }
  };

  // for main search
  let SearchComponent = {
    template: `<div class='container' :class='query.length > 0 ? "collapsed" : ""' id='search'>
  <div id='logo_container'>
    <img class='d-block m-auto' id='logo' src='assets/logo.png'>
  </div>
  <div class="input-group input-group-lg w-50 mx-auto pt-5" id='search_container'>
    <input
      autofocus
      ref='search_input'
      type="text"
      class="form-control"
      id='search'
      v-model='query'
      autocomplete='off'
      @keyup.enter='feeling_lucky'
      @keyup='search'
      placeholder='What is the golden ratio?'>
  </div>
  <div class='pt-3 pb-5 form-inline' id='filters' v-show='query.length > 0'>
    <label class='mr-2'>Filter by:</label> 
    <div class='input-group'>
      <select
        class='custom-select form-control mr-2'
        id='subject_filter'
        v-model='subject_filter'
        @change='search'>
        <option value='-1'>Subject</option>
        <option value='1'>Mathematics</option>
        <option value='2'>Science</option>
        <option value='3'>Literature</option>
        <option value='4'>Language</option>
        <option value='5'>Social Studies</option>
        <option value='6'>Health</option>
        <option value='7'>Art</option>
        <option value='8'>Education</option>
        <option value='0'>Other</option>
      </select>
    </div>
    <div class='input-group'>
      <select
        class='custom-select form-control mr-2'
        id='course_filter'
        v-model='course_filter'
        @change='search'>
        <option value='-1'>Course</option>
        <option value='0'>Other</option>
      </select>
    </div>
    <div class='input-group'>
      <button class='btn btn-outline-primary form-control mr-2' @click='toggle_map'>Location</button>
    </div>
  </div>
  <div class='mb-4' v-show='show_map'>
    <div class='d-block mx-auto' id='map_container' style='width:640px;height:480px;position:relative;overflow:hidden' ref='map_container'></div>
  </div>
  <div id='results'>
    <div class="list-group" v-show='query.length > 0'>
      <a href v-for='result in results' class="list-group-item list-group-item-action" @click='$emit("to-view","view_post",result.objectID);$event.preventDefault()'>
        {{ result.title }}
      </a>
    </div>
    <div v-show='query.length != 0 && results.length == 0'>
      <p class='text-secondary text-center'>No results were found.</p>
    </div>
    {{remove_map}}
  </div>
</div>`,
    data() {
      return {
        query: '',
        results: [],
        subject_filter: -1,
        course_filter: -1,
        location_filter: -1,
        geo_filter: -1,
        show_map: false,
        map: null,
        markers: []
      };
    },
    computed: {
      remove_map() {
        if(this.query.length == '' && this.show_map) {
          this.toggle_map();
        }
      }
    },
    methods: {
      search() {
        // determine which filters to use
        let filters = [];
        if(this.subject_filter != -1)
          filters.push('subject:' + this.subject_filter);
        if(this.course_filter != -1)
          filters.push('course:' + this.course_filter);
        Server.query(this.query, filters.join(' AND '), this.geo_filter, data => {
          // i feel super smart using splice and the spread operator =)
          this.results.splice(0, this.results.length, ...JSON.parse(data).hits);

          // add markers to map
          if(this.map)
            this.map.removeObjects(this.markers);
          this.markers = [];
          this.markers = this.results.map(result => new H.map.Marker(result._geoloc));
          if(this.map)
            this.map.addObjects(this.markers);
        });
      },
      feeling_lucky() {
        if(this.results.length > 0 && this.query.length > 0) {
          this.$emit('to-view', 'view_post', this.results[0].objectID);
        }
      },
      toggle_map() {
        this.show_map = !this.show_map;
        if(!this.show_map) {
          this.geo_filter = -1;
        }
        if(this.show_map) {
          setTimeout(() => {
            let platform = new H.service.Platform({
              'app_id': '5qyf1xaVdILt6uHyIx8J',
              'app_code': '_WZ8o92p1VEsJPfkuyZ7oQ'
            });
            let default_layers = platform.createDefaultLayers();
            this.map = new H.Map(this.$refs.map_container,
              default_layers.normal.map,
              {
                zoom: 4,
                center: { lat: 39, lng: -98 }
              });
            this.map.addObjects(this.markers);

            // event listener
            this.$refs.map_container.addEventListener('click', evt => {
              let coord = this.map.screenToGeo(evt.pageX - this.$refs.map_container.getBoundingClientRect().left, evt.pageY - this.$refs.map_container.getBoundingClientRect().top);
              this.geo_filter = coord.lat.toFixed(4) + ', ' + coord.lng.toFixed(4);
              this.search();
            });
          }, 500);
        }
      }
    },
    mounted() {
      this.$refs.search_input.focus();
    }
  };

  // for viewing a post
  let ViewPostComponent = {
    template: `<div class='container' id='post'>
  <h1>{{ title }}</h1>
  <p>Upvotes: {{ up_votes }} <button class='btn btn-outline-success' @click='upvote'>Upvote</button> | Downvotes: {{ down_votes }} <button class='btn btn-outline-danger' @click='downvote'>Downvote</button></p>
  <p>Keywords:
    <span class='badge badge-pill badge-light px-2' v-for='keyword in keywords'>{{ keyword }}</span> 
  </p>
  <p>Subject: {{ subject.name }}</p>
  <p>Course: {{ course.name }}</p>
  <p>User: <a href @click='$emit("to-view","user",uid.id);$event.preventDefault()'>{{ uid.username }}</a></p>
  <p>Location: {{ location.loc }}</p>
  <p>{{ body }}</p>
  <p class='mt-3'><a href @click='$emit("to-view", "search");$event.preventDefault()'>Return to search</a></p>
</div>`,
    props: {
      data: Object
    },
    computed: {
      up_votes() {
        return this.votes.up.length;
      },
      down_votes() {
        return this.votes.down,length;
      }
    },
    data() {
      return {
        title: '',
        votes: { up: [], down: [] },
        body: "",
        keywords: [],
        location: location,
        course: { name: '' },
        subject: { name: '' },
        uid: { username: '' }
      };
    },
    created() {
      Server.get_post(this.data.pid, data => {
        data = JSON.parse(data);
        this.title = data.title;
        this.votes = data.votes;
        this.body = data.body;
        this.keywords = data.keywords;
        this.location = JSON.parse(data.location);
        this.course = data.course;
        this.subject = data.subject;
        this.uid = data.uid;
      });
    },
    methods: {
      upvote() {
        Server.upvote(this.data.pid, _=>_);
        this.votes.up.push(null);
      },
      downvote() {
        Server.downvote(this.data.pid, _=>_);
        this.votes.down.push(null);
      }
    }
  };
  
  // for user profile
  let ProfileComponent = {
    template: `<div class='container'>
  <h1>Name: {{ name }}</h1>
  <p class='mt-3'><a href @click='$emit("to-view", "search");$event.preventDefault()'>Return to search</a></p>
</div>`,
    props: {
      data: Object
    },
    data() {
      return {
        name: ''
      }
    },
    created() {
      Server.get_username(this.data.uid, data => {
        this.name = data;
      });
    }
  }

  // create post
  let PostComponent = {
    template: `<div class='container'>
  <div class='alert alert-danger' v-if='!signed_in'>You must be signed in to add knowledge to Fluorination.</div>
  <div class='form-group'>
    <label for='title_input'>Title</label>
    <input
      class='form-control'
      ref='title_input'
      id='title_input'
      placeholder='Title'
      v-model='title'>
  </div>
  <div class='form-group'>
    <label for='title_input'>Keywords</label>
    <input
      class='form-control'
      id='keywords_input'
      placeholder='Keywords (comma-separated)'
      v-model='keywords'>
  </div>
  <div class='form-group'>
    <label for='location_input'>Location</label>
    <input
      class='form-control'
      id='location_input'
      placeholder='Location'
      v-model='location'>
  </div>
  <div class='form-group'>
    <label for='subject_select'>Subject</label>
    <select class='custom-select d-block w-auto' id='subject_select' v-model='subject'>
      <option value='-1'>Select a Subject</option>
      <option value='1'>Mathematics</option>
      <option value='2'>Science</option>
      <option value='3'>Literature</option>
      <option value='4'>Language</option>
      <option value='5'>Social Studies</option>
      <option value='6'>Health</option>
      <option value='7'>Art</option>
      <option value='8'>Education</option>
      <!-- dynamically fill this soon -->
      <option value='0'>Other</option>
    </select>
  </div>
  <div class='form-group'>
    <label for='course_select'>Course</label>
    <select class='custom-select d-block w-auto' id='course_select' v-model='course'>
      <option value='-1'>Select a Course</option>
      <!-- dynamically fill this soon -->
      <option value='0'>Other</option>
    </select>
  </div>
  <hr>
  <div class='form-group'>
    <textarea
      class='form-control'
      id='body_input'
      rows='20'
      placeholder='Enter knowledge here...'
      v-model='body'></textarea>
  </div>
  <div class='form-group'>
    <button class='btn btn-primary' @click='add_knowledge'>Add knowledge</button>
  </div>
  <p class='my-3'><a href @click='$emit("to-view", "search");$event.preventDefault()'>Return to search</a></p>
</div>`,
    data() {
      return {
        title: '',
        keywords: '',
        subject: -1,
        course: -1,
        location: '',
        body: '',
        signed_in: true
      };
    },
    methods: {
      add_knowledge() {
        Server.add_knowledge(this.title, this.keywords, this.subject, this.course, this.location, this.body, data => {
        });
      }
    },
    created() {
      // updated courses and location from server
      Server.get_userdata(data => {
        if(!data) this.signed_in = false;
      });
    },
    mounted() {
      this.$refs.title_input.focus();
    }
  };

  // about page
  let AboutComponent = {
    template: `<div class='container' id='about'>
  <h3>The Vision</h3>
  <p>Fluorination invites students to an interactive, informative, and immersive community with an education focused forum.</p>
  <p>In chemistry, "fluorination" describes carbon surrounded by fluorine. Fluorination bonds together many Flustered students to a Central community with the hope to create a Fluorishing Nation through higher education.</p>
  <p>Fluorine and carbon are shown at their best in toothpaste and diamond:</p>
  <ul>
    <li>Like toothpaste, Fluorination focuses on being accessible and helpful to everyone.</li>
    <li>Like diamond, Fluorination focuses on valuable, quality content to share.</li>
  </ul>
  <hr>
  <div class='float-right p-3'>
    <img class='d-block m-2 rounded' id='team_img' src='assets/team.png'>
    <div class='text-small text-secondary text-center'>From left: Andrew Kim, Dan(drew) Kim, Sunny Zhao, Jonathan Lam</div>
  </div>
  <h3>Meet the Team</h3>
  <p>...</p>
  <hr style='clear: both'>
  <h3>Libraries and Attributions</h3>
  <p>This website was put together with Bootstrap on the front end. The back end was built with <strong>Algolia</strong> (for search), <strong>Here.com</strong> (for geocoding), and Node.js.</p>
  <p>The website is hosted on Heroku's free hosting. There were difficulties connecting the project to the free Domain.com account.</p>
  <p>The logo was created in Inkscape. The photos were taken during the event.</p>
  <p>Mock content was written by team members during the event. All coding and brainstorming took place during the event.</p>
</div>`
  };

  // main app div
  let app = new Vue({
    el: '#app',
    data: {
      current_view: SearchComponent,
      username: null,
      uid: null,
      data: {}
    },
    methods: {
      to_view(view_name, data) {
        switch(view_name) {
          case 'sign_in': this.current_view = SignInComponent; break;
          case 'sign_up': this.current_view = SignUpComponent; break;
          case 'search': this.current_view = SearchComponent; break;
          case 'post': this.current_view = PostComponent; break;
          case 'about': this.current_view = AboutComponent; break;
          case 'user': this.current_view = ProfileComponent;
                       this.data = { uid: data };
                       break;
          case 'view_post': this.current_view = ViewPostComponent;
                       this.data = { pid: data };
                       break;
        }
      },
      update_user() {
        Server.get_userdata(data => {
          if(!data) {
            this.username = null;
            this.uid = null;
            return;
          }

          data = JSON.parse(data);
          this.username = data.username;
          this.uid = data.id;
        });
      },
      sign_out() {
        Server.sign_out(_ => {
          this.update_user();
        });
      }
    },
    created() {
      this.update_user();
    }
  });

})();
