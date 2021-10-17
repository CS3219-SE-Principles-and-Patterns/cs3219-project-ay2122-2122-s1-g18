Adapted from https://thewebdev.info/2020/03/01/create-a-vue-js-stopwatch/

<template>
  <h2>{{ formattedElapsedTime }}</h2>
</template>

<script>
let toAdd = null
let oldTime = null
let newTime = null

export default {
  data () {
    return {
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
      this.timer = setInterval(() => {
        this.elapsedTime += 1000
      }, 1000)
    },

    stop () {
      clearInterval(this.timer)
    },

    reset () {
      this.elapsedTime = 0
    },

    onClick () {
      toAdd = this.elapsedTime
      oldTime = new Date(new Date().getTime() + (1000 * 60 * 20))
    },

    onResume () {
      newTime = new Date(new Date().getTime() + (1000 * 60 * 20))
      const difference = newTime - oldTime
      this.elapsedTime = difference + toAdd
    }
  }
}
</script>
