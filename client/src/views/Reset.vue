<template>
  <b-row class="justify-content-center">
    <b-col cols="4" >
      <h3 class="text-center mb-4">Reset Password</h3>
      <b-alert v-if="missingField" show="30">
        Please enter a new password.
      </b-alert>
      <b-alert v-if="internalError" show="30">
        Token is invalid/expired. Please try again.
      </b-alert>
      <b-button
          v-if="success"
          variant="success"
          @click="landingPage"
          class="createButton mt-4 mb-2 px-5"
      >
        Password successfully reset. You can log in now
      </b-button>
      <form v-else @submit.prevent="handleSubmitForm">
        <div class="form-group">
          <input
              type="password"
              class="form-control"
              placeholder="New Password"
              v-model="user.newPassword"
              maxlength="10"
              required
          >
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button
              class="createButton mt-4 mb-2 px-5"
              variant="success"
              @click="handleSubmitForm"
          >
            Reset
          </b-button>
        </div>
      </form>
    </b-col>
  </b-row>
</template>

<script>
import axios from 'axios'
import { SERVER_URI } from '@/constants'

export default {
  name: 'Reset',
  data () {
    return {
      user: {
        newPassword: '',
        userId: '',
        token: ''
      },
      missingField: false,
      internalError: false,
      success: false
    }
  },
  methods: {
    handleSubmitForm () {
      this.success = false
      this.internalError = false
      this.missingField = this.user.newPassword.trim() === ''
      this.user.userId = this.$route.params.id
      this.user.token = this.$route.params.token
      if (!this.missingField) {
        const apiURL = `${SERVER_URI}/api/users/reset`
        axios.put(apiURL, this.user)
          .then((res) => {
            if (res.status === 200) {
              this.user.newPassword = ''
              this.success = true
            } else {
              this.internalError = true
            }
          })
          .catch(() => {
            this.internalError = true
          })
      }
    },
    landingPage () {
      this.$router.push({
        name: 'landing'
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
