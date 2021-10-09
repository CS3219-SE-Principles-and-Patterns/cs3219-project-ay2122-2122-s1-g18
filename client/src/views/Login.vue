<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h3 class="text-center">Login</h3>
      <b-alert v-if="missingField" show="30">Missing field. Please fill up all fields.</b-alert>
      <b-alert v-if="wrongCredentials" show="30">Wrong username/ password.</b-alert>
      <b-alert v-if="invalidEmail" show="30">Email not verified. Please verify your email before continuing.</b-alert>
      <form @submit.prevent="handleSubmitForm">
        <div class="form-group mb-2">
          <label class="mb-2">Username</label>
          <input type="text" class="form-control" v-model="user.username" required>
        </div>
        <div class="form-group">
          <label class="mb-2">Password</label>
          <input type="text" class="form-control" v-model="user.password" required>
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button class="createButton mt-4 mb-2 px-5" variant="success" @click="handleSubmitForm">Start</b-button>
        </div>
      </form>
      <b-button variant="link" :to="{name: 'signup'}" class="link justify-content-center d-flex">Sign up for an account instead!</b-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { SERVER_URI } from '../constants'

export default {
  name: 'Login',
  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      token: '',
      missingField: false,
      wrongCredentials: false,
      invalidEmail: false
    }
  },
  methods: {
    handleSubmitForm () {
      this.missingField = false
      this.wrongCredentials = false
      this.invalidEmail = false
      const apiURL = `${SERVER_URI}/api/user/login`
      axios.post(apiURL, this.user)
        .then((data) => {
          if (data && data.data) {
            this.token = data.data.token
            this.$router.push({
              name: 'home',
              params: {
                token: this.token
              }
            })
            this.username = ''
            this.password = ''
          } else {
            this.wrongCredentials = true
          }
        })
        .catch((err) => {
          const errMessage = err.response.data.message
          console.log(errMessage)
          if (errMessage === 'Authentication Failed: All Fields are Compulsory!') {
            this.missingField = true
          } else if (errMessage === 'Authentication Failed: Please verify account before continuing.') {
            this.invalidEmail = true
          } else {
            this.wrongCredentials = true
          }
        })
    }
  }
}
</script>

<style>
.createButton {
  color: black;
  background-color: #ffa8a1;
  outline-color: #ffa8a1;
  border-color: #ffa8a1;
}
.createButton:hover {
  color: black;
  background-color: #ffe5e3;
  outline-color: #ffe5e3;
  border-color: #ffe5e3;
}
.link {
  color: #5f8195;
}
.link:hover {
  color: #b3c3ce;
}
</style>
