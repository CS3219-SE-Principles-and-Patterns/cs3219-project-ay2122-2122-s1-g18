<template>
  <div class="row justify-content-center">
    <h1>Home {{$route.params.token}}</h1>
    <div class="form-group justify-content-center d-flex">
      <b-button class="createButton mt-4 mb-2 px-5" @click="handleMatch">
        Find a Match
      </b-button>
    </div>
  </div>
</template>

<script>
// TODO: allow access only if authenticated
export default {
  name: 'home',
  methods: {
    handleMatch () {
      this.$router.push({ name: 'matching' })
    }
  }
}
</script>
