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
            <b-alert v-if="isNewUser" show="30">
              An email has been sent to your account. Verify before proceeding.
            </b-alert>
            <login @change-view="changeView"></login>
          </div>
          <div v-if="!isLoginView">
            <signup @change-view="changeView"></signup>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Login from '@/views/Login'
import Signup from '@/views/Signup'
// TODO: Design left panel to introduce PeerPrep
export default {
  name: 'Landing',
  components: { Signup, Login },
  data () {
    return {
      isLogin: true,
      newUser: false
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
        console.log(this.isLogin)
      }
      console.log(isNewUser)
    }
  }
}
</script>

<style>
.right-panel {
  height: 460px;
}
</style>
