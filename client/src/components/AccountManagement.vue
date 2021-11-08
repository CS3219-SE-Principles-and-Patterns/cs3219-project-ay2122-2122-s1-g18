<template>
  <div>
    <b-dropdown
      id="dropdown-1"
      right
      text="Profile Settings"
      class="md-2"
      variant="dark"
    >
      <b-dropdown-item v-b-modal.modal-1 @click="resetState">Change Password</b-dropdown-item>
      <b-dropdown-item v-b-modal.modal-2 @click="resetState">Delete Account</b-dropdown-item>
      <b-dropdown-item @click="logout">Log Out</b-dropdown-item>
    </b-dropdown>
    <b-modal id="modal-1" title="Change Password" hide-footer>
      <h6 v-if="missingField">
        Missing field. Please fill up all fields.
      </h6>
      <h6 v-if="wrongCredentials">
        Wrong credentials. Unable to change password.
      </h6>
      <h6 v-if="internalError">
        Unable to change password. Please reload and try again.
      </h6>
      <h6 v-if="updateSuccess">Your password have been changed.</h6>
      <form v-else @submit.prevent="handleUpdateForm">
        <div class="form-group mb-4">
          <input
              type="password"
              class="form-control"
              placeholder="Old Password"
              v-model="user.oldPassword"
              required
          >
        </div>
        <div class="form-group">
          <input
              type="password"
              class="form-control"
              placeholder="New Password"
              v-model="user.newPassword"
              required
          >
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button
            class="button px-5"
            variant="dark"
            @click="handleUpdateForm"
          >
            Change Password
          </b-button>
        </div>
      </form>
    </b-modal>
    <b-modal id="modal-2" title="Delete Account" hide-footer>
      <h6 v-if="missingField">
        Missing field. Please fill up all fields.
      </h6>
      <h6 v-if="wrongCredentials">
        Wrong credentials. Unable to delete account.
      </h6>
      <h6 v-if="internalError">
        Unable to delete account. Please reload and try again.
      </h6>
      <h6>Are you sure you want to delete your account?</h6>
      <form @submit.prevent="handleDeleteForm">
        <div class="form-group">
          <input
              type="password"
              class="form-control"
              placeholder="Enter password to confirm delete"
              v-model="user.oldPassword"
              required
          >
        </div>
        <div class="form-group justify-content-center d-flex">
          <b-button
              class="button px-5"
              variant="dark"
              @click="handleDeleteForm"
          >
            Delete Account
          </b-button>
        </div>
      </form>
    </b-modal>
  </div>
</template>

<script>
import AXIOS, { getAuthHeader } from '../utils/axiosConfig'

export default {
  data () {
    return {
      user: {
        username: '',
        oldPassword: '',
        newPassword: ''
      },
      updateSuccess: false,
      wrongCredentials: false,
      internalError: false,
      missingField: false
    }
  },
  methods: {
    resetState () {
      this.updateSuccess = false
      this.wrongCredentials = false
      this.internalError = false
      this.missingField = false
      this.user.oldPassword = ''
      this.user.newPassword = ''
    },
    logout () {
      const apiURL = '/api/users/verify/checkAuth'
      AXIOS.post(apiURL, {}, { headers: getAuthHeader() })
        .then(() => {
          sessionStorage.clear()
          this.$router.push({
            name: 'landing'
          })
        })
        .catch(() => {
          console.log('Unable to logout')
        })
    },
    handleUpdateForm () {
      this.updateSuccess = false
      this.wrongCredentials = false
      this.internalError = false
      this.missingField = this.user.oldPassword.trim() === '' || this.user.newPassword.trim() === ''
      if (!this.missingField) {
        const apiURL = '/api/users'
        this.user.username = JSON.parse(sessionStorage.getItem('username'))
        AXIOS.put(apiURL, this.user, { headers: getAuthHeader() })
          .then(() => {
            this.user.oldPassword = ''
            this.user.newPassword = ''
            this.updateSuccess = true
          })
          .catch((err) => {
            if (err.response.status === 401) {
              this.wrongCredentials = true
            } else {
              this.internalError = true
            }
          })
      }
    },
    handleDeleteForm () {
      this.wrongCredentials = false
      this.internalError = false
      this.missingField = this.user.oldPassword.trim() === ''
      if (!this.missingField) {
        const apiURL = '/api/users'
        this.user.username = JSON.parse(sessionStorage.getItem('username'))
        const temp = {
          username: this.user.username,
          password: this.user.oldPassword
        }
        AXIOS.delete(apiURL, { headers: getAuthHeader(), data: temp })
          .then(() => {
            this.user.oldPassword = ''
            this.logout()
          })
          .catch((err) => {
            if (err.response.status === 401) {
              this.wrongCredentials = true
            } else {
              this.internalError = true
            }
          })
      }
    }
  }
}
</script>
