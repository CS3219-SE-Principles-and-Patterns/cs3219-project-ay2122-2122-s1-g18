<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h3 class="text-center">Create an account</h3>
      <b-alert v-if="missingField" show="10">Missing field. Please fill up all fields.</b-alert>
      <b-alert v-if="invalidEmail" show="10">Invalid email format. Please provide a valid email</b-alert>
      <b-alert v-if="emailUsernameExists" show="10">Email/Username already exists.</b-alert>
      <b-alert v-if="fail" show="10">Failed to create account. Please try again later.</b-alert>
      <form @submit.prevent="handleSubmitForm">
        <div class="form-group mb-2">
          <label class="mb-2">Email</label>
          <input type="text" class="form-control" v-model="user.email" required>
        </div>
        <div class="form-group">
          <label class="mb-2">Username</label>
          <input type="text" class="form-control" v-model="user.username" required>
        </div>
        <div class="form-group">
          <label class="mb-2">Password</label>
          <input type="text" class="form-control" v-model="user.password" required>
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button class="createButton mt-4 mb-2 px-5" variant="success" @click="handleSubmitForm">Create</b-button>
        </div>
      </form>
      <b-button variant="link" :to="{name: 'login'}" class="link justify-content-center d-flex">Already have an account? Login here!</b-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
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
      const apiURL = 'http://localhost:8000/api/user/signup'
      axios.post(apiURL, this.user)
        .then(() => {
          this.$router.push({
            name: 'login',
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
