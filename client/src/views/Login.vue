<template>
  <b-row class="justify-content-center">
    <b-col cols="8" >
      <h3 class="text-center mb-4">Log In</h3>
      <b-alert v-if="isNewUser" show="30">
        An email has been sent to your account. Verify before proceeding.
      </b-alert>
      <b-alert v-if="missingField" show="30">
        Missing field. Please fill up all fields.
      </b-alert>
      <b-alert v-if="wrongCredentials" show="30">
        Wrong username/ password.
      </b-alert>
      <b-alert v-if="invalidEmail" show="30">
        Email not verified. Please verify your email before continuing.
      </b-alert>
      <form @submit.prevent="handleSubmitForm">
        <div class="form-group mb-4">
          <input
              type="text"
              placeholder="Username"
              class="form-control"
              v-model="user.username"
              required
          >
        </div>
        <div class="form-group">
          <input
              type="password"
              class="form-control"
              placeholder="Password"
              v-model="user.password"
              required
          >
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button
            class="createButton mt-4 mb-2 px-5"
            variant="success"
            @click="handleSubmitForm"
          >
            Log In
          </b-button>
        </div>
      </form>
    </b-col>
    <b-button
        variant="link"
        @click="changeView"
        class="link justify-content-center d-flex"
    >
      Do not have an account? Sign up here!
    </b-button>
  </b-row>
</template>

<script>
import axios from 'axios'
import { SERVER_URI } from '@/constants'

export default {
  name: 'Login',
  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      missingField: false,
      wrongCredentials: false,
      invalidEmail: false
    }
  },
  computed: {
    isNewUser () {
      return this.$route.params.newUser
    }
  },
  methods: {
    handleSubmitForm () {
      this.missingField = false
      this.wrongCredentials = false
      this.invalidEmail = false
      const apiURL = `${SERVER_URI}/api/users`
      axios.post(apiURL, this.user)
        .then((data) => {
          if (data && data.data) {
            sessionStorage.setItem('username', JSON.stringify(data.data.username))
            sessionStorage.setItem('token', JSON.stringify(data.data.token))
            this.$router.push({
              name: 'home'
            })
            this.username = ''
            this.password = ''
          } else {
            this.wrongCredentials = true
          }
        })
        .catch((err) => {
          const errMessage = err.response.data.message
          if (errMessage === 'Authentication Failed: All Fields are Compulsory!') {
            this.missingField = true
          } else if (errMessage === 'Authentication Failed: Please verify account before continuing.') {
            this.invalidEmail = true
          } else {
            this.wrongCredentials = true
          }
        })
    },
    changeView () {
      this.$emit('change-view', false)
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
