<template>
  <b-row class="justify-content-center">
    <b-col cols="8">
      <h3 class="text-center mb-4">Log In</h3>
      <b-alert v-if="missingField" variant="warning" show="30">
        Missing field. Please fill up all fields.
      </b-alert>
      <b-alert v-if="wrongCredentials" variant="warning" show="30">
        Wrong username/password.
      </b-alert>
      <b-alert v-if="invalidEmail" variant="warning" show="30">
        Email not verified. Please verify your email before continuing.
      </b-alert>
      <form @submit.prevent="handleSubmitForm">
        <div class="form-group mb-3">
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
            class="button px-5"
            variant="dark"
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
    <b-button
      variant="link"
      @click="resetPassword"
      class="link justify-content-center d-flex"
    >
      Forgot your password? Click here to reset!
    </b-button>
  </b-row>
</template>

<script>
import AXIOS from '../utils/axiosConfig'

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
      const apiURL = '/api/users'
      AXIOS.post(apiURL, this.user)
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
    },
    resetPassword () {
      this.$emit('reset-password')
    }
  }
}
</script>
