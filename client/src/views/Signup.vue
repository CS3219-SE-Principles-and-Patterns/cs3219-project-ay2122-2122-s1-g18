<template>
  <b-row class="row justify-content-center">
    <b-col cols="8">
      <h3 class="text-center mb-4">Create an account</h3>
      <b-alert v-if="missingField" show="10">
        Missing field. Please fill up all fields.
      </b-alert>
      <b-alert v-if="invalidEmail" show="10">
        Invalid email format. Please provide a valid email
      </b-alert>
      <b-alert v-if="emailUsernameExists" show="10">
        Email/Username already exists.
      </b-alert>
      <b-alert v-if="fail" show="10">
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
            variant="success"
            @click="handleSubmitForm"
          >
            Create
          </b-button>
        </div>
      </form>
    </b-col>
    <b-button
        variant="link"
        @click="changeView"
        class="link justify-content-center d-flex"
    >
      Already have an account? Login here!
    </b-button>
  </b-row>
</template>

<script>
import axios from 'axios'
import { SERVER_URI } from '../constants'
import authHeader from '@/utils/authHeader'

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
  beforeCreate () {
    const apiURL = `${SERVER_URI}/api/users/verify/checkAuth`
    axios.get(apiURL, { headers: authHeader() })
      .then(() => {
        this.$router.push({
          name: 'home'
        })
      })
      .catch(() => {
        console.log('Please login or signup')
      })
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
          this.$router.push({
            name: 'home',
            params: {
              newUser: true
            }
          })
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
    changeView () {
      this.$emit('change-view')
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
