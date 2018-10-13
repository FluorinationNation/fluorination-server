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
    get_username(cb) {
      this.send_request('get_username', {}, cb);
    },
    sign_out(cb) {
      this.send_request('sign_out', {}, cb);
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
  <div class="input-group input-group-lg w-50 m-auto">
    <input
      type="text"
      class="form-control"
      id='search'
      placeholder='What is the golden ratio?'>
    <div class="input-group-append">
      <span class="input-group-text p-0 border-primary" style='overflow: hidden' id="inputGroup-sizing-lg"><button class='btn btn-lg btn-primary w-100 h-100 rounded-0'>Search</button></span>
    </div>
  </div>
</div>`
  };
  
  // for user profile
  let ProfileComponent = {
    template: `<div class='container'>
  <h1>Name: {{ data.name }}</h1>
</div>`,
    props: {
      data: Object
    }
  }

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
                       this.data = { name: data };
                       break;
        }
      },
      update_user() {
        Server.get_username(data => {
          this.username = data;
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
