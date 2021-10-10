<template>
  <div>
    <div class='container d-flex justify-content-center'>
      <Timer ref='timer' :timeLimit='TIME_LIMIT' @timesUp='handleTimesUp'/>
    </div>
    <div class='row justify-content-center mt-4'>Please wait while we find you a match.</div>

    <b-modal
      :visible='showMatchNotFoundModal'
      centered
      hide-header-close
      hide-footer
      no-close-on-backdrop
      title='No Match Available'
    >
      <p>Unfortunately, we could not find you a match.</p>
      <div class='d-grid gap-2'>
        <b-button
          variant='outline-primary'
          block
          @click='handleWait'
        >
          Wait another {{ TIME_LIMIT }} seconds
        </b-button>

        <b-button
          variant='outline-primary'
          block
          @click='handleGoBackToHome'
        >
          Select another difficulty level
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Timer from '../components/Timer'

export default {
  name: 'matching',
  components: {
    Timer
  },
  data () {
    return {
      TIME_LIMIT: 30,
      showMatchNotFoundModal: false
    }
  },
  methods: {
    handleTimesUp () {
      this.showMatchNotFoundModal = true
    },

    handleWait () {
      this.showMatchNotFoundModal = false
      this.$refs.timer.restartTimer()
    },

    handleGoBackToHome () {
      this.showMatchNotFoundModal = false
      this.$router.push({ name: 'home' })
    }
  }
}
</script>
