<template>
<!--  <div class="justify-content-center d-flex">-->
    <b-button
        class="logOutButton px-5"
        variant="success"
        @click="logout"
    >
      Log Out
    </b-button>
<!--  </div>-->
</template>

<script>
import axios from 'axios'
import authHeader from '../utils/authHeader'
import { SERVER_URI } from '@/constants'

export default {
  methods: {
    logout () {
      const apiURL = `${SERVER_URI}/api/users/verify/checkAuth`
      axios.post(apiURL, {}, { headers: authHeader() })
        .then(() => {
          sessionStorage.clear()
          this.$router.push({
            name: 'landing'
          })
        })
        .catch(() => {
          console.log('Unable to logout')
        })
    }
  }
}
</script>

<style>
.logOutButton:hover {
  color: black;
  background-color: #ffa8a1;
  outline-color: #ffa8a1;
  border-color: #ffa8a1;
}
.logOutButton {
  color: black;
  background-color: #ffe5e3;
  outline-color: #ffe5e3;
  border-color: #ffe5e3;
}
</style>
