<template>
  <div>
    <!-- Nav bar -->
    <nav class="navbar justify-content-between flex-nowrap flex-row">
      <div class="container d-flex justify-content-center">
        <h3 class="fw-bold mt-4 mb-4">PeerPrep</h3>
      </div>
    </nav>

    <!-- Router view -->
    <div class="container mt-5">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.navbar {
  background-color: #ffa8a1;
  height: 60px;
}
</style>
