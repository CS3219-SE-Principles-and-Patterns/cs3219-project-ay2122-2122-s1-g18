Adapted from https://thewebdev.info/2020/03/01/create-a-vue-js-stopwatch/

<template>
  <h3>{{ formattedElapsedTime }}</h3>
</template>

<script>
export default {
  data () {
    return {
      timeStart: null,
      elapsedTime: 0,
      timer: undefined
    }
  },

  mounted () {
    this.start()
  },

  computed: {
    formattedElapsedTime () {
      const date = new Date(null)
      date.setSeconds(this.elapsedTime / 1000)
      const utc = date.toUTCString()
      return utc.substr(utc.indexOf(':') - 2, 8)
    }
  },

  methods: {
    start () {
      this.timeStart = new Date()
      this.timer = setInterval(() => (this.elapsedTime = new Date() - this.timeStart), 1000)
    },

    reset () {
      this.timeStart = new Date()
    }
  }
}
</script>
