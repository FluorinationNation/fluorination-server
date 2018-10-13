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
      id='username_input'
      v-model='username'
      placeholder='johnny_appleseed'>
  </div>
  <div class='form-group'>
    <label for='password_input'>Password</label>
    <input
      class='form-control w-auto'
      type='password'
      id='password_input'
      v-model='password'
      placeholder='⁎⁎⁎⁎⁎⁎'>
  </div>
  <div class='form-group'>
    <label for='location_select'>Location</label>
    <select class='custom-select d-block w-auto' id='location_select' v-model='loc'>
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
          if(data)
            this.$emit('update-user');
        });
      }
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
      id='username_input'
      v-model='username'
      placeholder='bucky'>
  </div>
  <div class='form-group'>
    <label for='password_input'>Password</label>
    <input
      class='form-control w-auto'
      type='password'
      id='password_input'
      v-model='password'
      placeholder='⁎⁎⁎⁎⁎⁎'>
  </div>
  <div>
    <button class='btn btn-primary w-auto' @click='sign_in'>Sign in</button>
  </div>
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
          if(data)
            this.$emit('update-user');
        });
      }
    }
  };

  // for main search
  let SearchComponent = {
    template: `<div class='container' id='search'>
  <div>
    <img class='d-block m-auto' id='logo' src='assets/logo.png'>
  </div>
  <div class="input-group input-group-lg w-50 mx-auto pt-5">
    <input
      type="text"
      class="form-control"
      id='search'
      placeholder='What is the golden ratio?'>
    <div class="input-group-append">
      <span class="input-group-text p-0 border-primary" style='overflow: hidden' id="inputGroup-sizing-lg"><button class='btn btn-lg btn-primary w-100 h-100 rounded-0' @click='$emit("to-view", "view_post", "8")'>Search</button></span>
    </div>
  </div>
</div>`
  };

  // for viewing a post
  let ViewPostComponent = {
    template: `<div class='container' id='post'>
  <h1>{{ title }}</h1>
  <p>Upvotes: {{ up_votes }} | Downvotes: {{ down_votes }}</p>
  <p>Keywords:
    <span v-for='keyword in keywords'>{{ keyword }}</span> 
  </p>
  <p>Subject: {{ subject.name }}</p>
  <p>Course: {{ course.name }}</p>
  <p>User: <a href @click='$emit("to-view","user",uid.id);$event.preventDefault()'>{{ uid.username }}</a></p>
  <p>Location: {{ location }}</p>
  <p>{{ body }}</p>
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
        this.location = data.location;
        this.course = data.course;
        this.subject = data.subject;
        this.uid = data.uid;
      });
    }
  };
  
  // for user profile
  let ProfileComponent = {
    template: `<div class='container'>
  <h1>Name: {{ name }}</h1>
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
  <div class='form-group'>
    <label for='title_input'>Title</label>
    <input
      class='form-control'
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
      <option value='-1'>Select a Subject</option>
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
</div>`,
    data() {
      return {
        title: '',
        keywords: '',
        subject: -1,
        course: -1,
        location: '',
        body: ''
      };
    },
    methods: {
      add_knowledge() {
        Server.add_knowledge(this.title, this.keywords, this.subject, this.course, this.location, this.body, data => {
          console.log(data);
        });
      }
    },
    created() {
      // updated courses and location from server
    }
  };

  // register components for testing
  Vue.component('sign-in', SignInComponent);
  Vue.component('sign-up', SignUpComponent);
  Vue.component('search', SearchComponent);

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
