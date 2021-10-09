<template>
  <div class="row justify-content-center">
    <h1>Home {{$route.params.token}}</h1>
  </div>
</template>

<script>
// TODO: allow access only if authenticated
export default {
  name: 'home'
}
</script>
