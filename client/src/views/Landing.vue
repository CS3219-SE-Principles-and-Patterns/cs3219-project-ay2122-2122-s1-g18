<template>
  <div>
    <b-row>
      <b-col sm="12" md="6">
        <b-card>
          <h3 class="text-center mb-4">About SHReK Tech</h3>
          <b-card-text>
            SHReK Tech aims to help students and jobseekers boost their technical interview skills
            to land their dream job. In SHReK Tech, SHReKies can engage in real-time, collaborative
            programming to enhance their familiarity with technical interviews.
          </b-card-text>
        </b-card>
      </b-col>
      <b-col sm="12" md="6">
        <b-card>
          <div v-if="isLoginView">
            <b-alert v-if="isNewUser" variant="success" show="5">
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
    <b-modal id="modal-1" title="Reset Password" hide-backdrop content-class="shadow" hide-footer>
      <b-alert v-if="missingField" variant="warning" show="30">
        Please enter your email address.
      </b-alert>
      <b-alert v-if="internalError" variant="warning" show="30">
        Unable to update password. Please reload and try again.
      </b-alert>
      <b-alert v-if="invalidEmail" variant="warning" show="30">
        Invalid email format.
      </b-alert>
      <b-alert v-if="userNotFound" variant="warning" show="30">
        Unable to find user. Please create an account instead.
      </b-alert>
      <b-alert v-if="success" variant="success" show="30">
        Please check your email for further instructions.
      </b-alert>
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
            variant="dark"
            class="button px-5"
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
import Login from '../components/Login'
import Signup from '../components/Signup'

import AXIOS from '../utils/axiosConfig'

export default {
  name: 'landing',
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
        const apiURL = '/api/users/reset'
        AXIOS.post(apiURL, this.user)
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
