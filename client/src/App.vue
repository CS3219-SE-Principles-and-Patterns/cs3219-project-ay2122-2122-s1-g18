<template>
  <div>
    <!-- Nav bar -->
    <nav class="nav-bar justify-content-between flex-nowrap flex-row">
      <b-container fluid>
        <b-row>
          <b-col cols="10">
            <h3 class="fw-bold mt-3 mb-3 ms-5">PeerPrep</h3>
          </b-col>
          <b-col cols="2" v-if="isLogin">
            <logout class="mt-3 mb-3"></logout>
          </b-col>
        </b-row>
      </b-container>
    </nav>

    <!-- Router view -->
    <div class="container mt-5">
      <router-view />
    </div>
  </div>
</template>

<script>
import Logout from '@/components/Logout'
export default {
  name: 'App',
  components: { Logout },
  computed: {
    isLogin () {
      return this.$route.name !== 'landing'
    }
  }
}
</script>

<style>
.nav-bar {
  background-color: #ffa8a1;
  height: 70px;
}
</style>
