<template>
  <b-row class="row justify-content-center">
    <b-col cols="8">
      <h3 class="text-center mb-4">Create an account</h3>
      <b-alert v-if="missingField" variant="primary" show="10">
        Missing field. Please fill up all fields.
      </b-alert>
      <b-alert v-if="invalidEmail" variant="primary" show="10">
        Invalid email format. Please provide a valid email
      </b-alert>
      <b-alert v-if="emailUsernameExists" variant="primary" show="10">
        Email/Username already exists.
      </b-alert>
      <b-alert v-if="fail" variant="primary" show="10">
        Failed to create account. Please try again later.
      </b-alert>
      <form @submit.prevent="handleSubmitForm">
        <div class="form-group mb-4">
          <input
              type="text"
              class="form-control"
              placeholder="Email"
              v-model="user.email"
              required
          >
        </div>
        <div class="form-group mb-4">
          <input
              type="text"
              class="form-control"
              placeholder="Username"
              v-model="user.username"
              required
          >
        </div>
        <div class="form-group mb-4">
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
            class="createButton mb-2 px-5"
            @click="handleSubmitForm"
          >
            Create
          </b-button>
        </div>
      </form>
    </b-col>
    <b-button
        variant="link"
        @click="changeView(false)"
        class="link justify-content-center d-flex"
    >
      Already have an account? Login here!
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
import axios from 'axios'
import { SERVER_URI } from '../constants'

export default {
  name: 'Signup',
  data () {
    return {
      user: {
        username: '',
        email: '',
        password: ''
      },
      missingField: false,
      invalidEmail: false,
      emailUsernameExists: false,
      fail: false
    }
  },

  methods: {
    handleSubmitForm () {
      this.missingField = false
      this.invalidEmail = false
      this.emailUsernameExists = false
      this.fail = false
      const apiURL = `${SERVER_URI}/api/users/signup`
      axios.post(apiURL, this.user)
        .then(() => {
          this.changeView(true)
        })
        .catch((err) => {
          const errMessage = err.response.data.message
          if (errMessage === 'Failure: All Fields are Compulsory!') {
            this.missingField = true
          } else if (errMessage === 'Failure: Invalid Email Format!') {
            this.invalidEmail = true
          } else if (errMessage === 'Failure: Duplicate Username/Email!') {
            this.emailUsernameExists = true
          } else {
            this.fail = true
          }
        })
    },
    changeView (isNewUser) {
      this.$emit('change-view', isNewUser)
    },
    resetPassword () {
      this.$emit('reset-password')
    }
  }
}
</script>

<style>
.link.link {
  color: darkslategray;
}
.link.link:hover {
  color: grey;
}

.createButton .createButton:focus .createButton:hover{
  border: #D3CCA5 !important;
  color: black;
}
</style>
