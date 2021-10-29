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

        <b-button
          variant='outline-primary'
          block
          @click='handleProceedWithoutMatch'
        >
          Proceed without a match
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import io from 'socket.io-client'
import Timer from '../components/Timer'
import { SERVER_URI } from '../constants'

export default {
  name: 'matching',
  components: {
    Timer
  },

  data () {
    return {
      TIME_LIMIT: 30,
      matchBy: this.$route.params.matchBy,
      socket: io(SERVER_URI),
      showMatchNotFoundModal: false
    }
  },

  created () {
    this.socket.on('connect', () => this.findMatch())
    window.onpopstate = () => this.socket.disconnect()
  },

  methods: {
    findMatch () {
      this.socket.emit('find-match', this.matchBy)
      this.socket.on('match-found', (roomInfo) => this.socket.emit('join-room', roomInfo))
      this.socket.on('coding-room-ready', (roomInfo) => {
        this.$router.push({
          name: 'codingroom',
          params: {
            socket: this.socket,
            id: roomInfo.id,
            hasMatch: true,
            isInterviewer: this.isInterviewer(this.socket.id, roomInfo.interviewer),
            difficulty: this.matchBy,
            codingQuestionIdx: roomInfo.codingQuestionIdx,
            codingQuestionIdx2: roomInfo.codingQuestionIdx2
          }
        })
      })
    },

    isInterviewer (socketId, interviewerId) {
      return socketId === interviewerId
    },

    handleTimesUp () {
      this.showMatchNotFoundModal = true
      this.socket.emit('end-wait', this.matchBy)
    },

    handleWait () {
      this.showMatchNotFoundModal = false
      this.$refs.timer.restartTimer()
      this.findMatch()
    },

    handleGoBackToHome () {
      this.showMatchNotFoundModal = false
      this.$router.push({ name: 'home' })
    },

    handleProceedWithoutMatch () {
      this.$router.push({
        name: 'codingroom',
        params: {
          socket: this.socket,
          id: this.socket.id,
          isInterviewer: true,
          hasMatch: false
        }
      })
    }
  }
}
</script>
