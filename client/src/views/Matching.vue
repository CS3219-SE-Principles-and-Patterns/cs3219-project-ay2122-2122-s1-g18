<template>
  <div>
    <div class='container d-flex justify-content-center'>
      <Timer ref='timer' :timeLimit='TIME_LIMIT' @timesUp='handleTimesUp'/>
    </div>
    <div class='row justify-content-center mt-4'>Please wait while we find you a match.</div>

    <b-modal
      id='matchNotFoundModal'
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
          variant='outline-dark'
          block
          @click='handleWait'
        >
          Wait another {{ TIME_LIMIT }} seconds
        </b-button>

        <b-button
          variant='outline-dark'
          block
          @click='handleGoBackToHome'
        >
          Select another difficulty level
        </b-button>

        <b-button
          variant='outline-dark'
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
      showMatchNotFoundModal: false,
      username: JSON.parse(sessionStorage.getItem('username'))
    }
  },

  created () {
    this.socket.on('connect', () => this.findMatch())
    window.onpopstate = () => this.socket.disconnect()
  },

  methods: {
    findMatch () {
      this.socket.emit('find-match', {
        username: this.username,
        matchBy: this.matchBy
      })
      this.socket.on('match-found', (roomInfo) => {
        this.socket.emit('join-room', this.username, roomInfo)
      })
      this.socket.on('coding-room-ready', (roomInfo) => {
        this.$router.push({
          name: 'codingroom',
          params: {
            socket: this.socket,
            id: roomInfo.id,
            hasMatch: true,
            isInterviewer: this.isInterviewer(this.socket.id, roomInfo.interviewer),
            difficulty: this.matchBy,
            codingQuestion1Id: roomInfo.codingQuestion1Id,
            codingQuestion2Id: roomInfo.codingQuestion2Id
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
      this.socket.disconnect()
      this.showMatchNotFoundModal = false
      this.$router.push({ name: 'home' })
    },

    handleProceedWithoutMatch () {
      this.socket.emit('proceed-without-match', {
        matchBy: this.matchBy
      })
      this.socket.on('coding-room-ready-solo', (roomInfo) => {
        this.$router.push({
          name: 'codingroom',
          params: {
            socket: this.socket,
            id: this.socket.id,
            isInterviewer: true,
            hasMatch: false,
            difficulty: this.matchBy,
            codingQuestion1Id: roomInfo.codingQuestion1Id
          }
        })
      })
    }
  }
}
</script>
