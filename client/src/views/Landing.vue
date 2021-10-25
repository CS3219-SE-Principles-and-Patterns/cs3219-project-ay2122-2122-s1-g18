<template>
  <div>
    <b-row>
      <b-col cols="6">
        <b-card class="left-panel" title="About PeerPrep">
          <b-card-text>
            PeerPrep is a project that aims to help students with their technical interview.
          </b-card-text>
        </b-card>
      </b-col>
      <b-col cols="6">
        <b-card class="right-panel">
          <div v-if="isLoginView">
            <b-alert v-if="isNewUser" show="5">
              An email has been sent to your account. Verify before proceeding.
            </b-alert>
            <login @change-view="changeView" @reset-password="showModal"></login>
          </div>
          <div v-if="!isLoginView">
            <signup @change-view="changeView" @reset-password="showModal"></signup>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-modal id="modal-1" title="Reset Password" hide-footer>
      <h6 v-if="missingField">
        Please enter your email address.
      </h6>
      <h6 v-if="internalError">
        Unable to update password. Please reload and try again.
      </h6>
      <h6 v-if="invalidEmail">
        Invalid email format.
      </h6>
      <h6 v-if="userNotFound">
        Unable to find user. Please create an account instead.
      </h6>
      <h6 v-if="success">
        Please check your email for further instructions.
      </h6>
      <form v-else @submit.prevent="handleSubmitForm">
        <div class="form-group mb-4">
          <input
              type="text"
              class="form-control"
              placeholder="Email"
              v-model="user.email"
              required
          >
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button
              class="createButton mb-2 px-5"
              variant="success"
              @click="handleSubmitForm"
          >
            Reset Password
          </b-button>
        </div>
      </form>
    </b-modal>
  </div>
</template>

<script>
import Login from '../views/Login'
import Signup from '../views/Signup'
import { SERVER_URI } from '../constants'
import axios from 'axios'
// TODO: Design left panel to introduce PeerPrep
export default {
  name: 'Landing',
  components: { Signup, Login },
  data () {
    return {
      isLogin: true,
      newUser: false,
      user: {
        email: ''
      },
      missingField: false,
      invalidEmail: false,
      userNotFound: false,
      internalError: false,
      success: false
    }
  },
  computed: {
    isLoginView () {
      return this.isLogin
    },
    isNewUser () {
      return this.newUser
    }
  },
  methods: {
    changeView (isNewUser) {
      this.newUser = false
      this.isLogin = !this.isLogin
      if (isNewUser) {
        this.newUser = true
      }
    },
    handleSubmitForm () {
      this.invalidEmail = false
      this.userNotFound = false
      this.internalError = false
      this.success = false
      this.missingField = this.user.email.trim() === ''
      if (!this.missingField) {
        const apiURL = `${SERVER_URI}/api/users/reset`
        axios.post(apiURL, this.user)
          .then((res) => {
            if (res.status === 200) {
              this.user.email = ''
              this.success = true
            } else {
              this.internalError = true
            }
          })
          .catch((err) => {
            if (err.response.status === 400) {
              this.invalidEmail = true
            } else if (err.response.status === 404) {
              this.userNotFound = true
            } else {
              this.internalError = true
            }
          })
      }
    },
    showModal () {
      this.invalidEmail = false
      this.userNotFound = false
      this.internalError = false
      this.missingField = false
      this.success = false
      this.$root.$emit('bv::show::modal', 'modal-1', '#btnShow')
    }
  }
}
</script>

<style>
.right-panel {
  height: 460px;
}
</style>
