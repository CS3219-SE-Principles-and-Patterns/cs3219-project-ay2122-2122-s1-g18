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
import axios from 'axios'
import io from 'socket.io-client'
import Timer from '../components/Timer'
import { SERVER_URI, SOCKET_URI } from '../constants'

export default {
  name: 'matching',
  components: {
    Timer
  },
  data () {
    return {
      TIME_LIMIT: 30,
      WAITING_ROOM_RESPONSE_TIMEOUT: 1000,
      matchBy: this.$route.params.matchBy,
      socket: io(SOCKET_URI),
      showMatchNotFoundModal: false,
      waitingRoomTimeout: null
    }
  },
  created () {
    this.socket.on('connect', () => this.findMatch())
  },
  methods: {
    findMatch () {
      this.socket.emit('find-match', this.matchBy, this.socket.id)
      this.waitingRoomTimeout = setTimeout(() => {
        this.joinWaitingRoom()
      }, this.WAITING_ROOM_RESPONSE_TIMEOUT)
      this.socket.on('match-found', () => {
        clearTimeout(this.waitingRoomTimeout)
        this.$router.push({
          name: 'codingroom',
          params: {
            socket: this.socket,
            id: this.socket.id
          }
        })
      })
    },

    joinWaitingRoom () {
      this.socket.emit('join-wait', this.matchBy)
      this.socket.on('match-request', async (partnerSocketId) => {
        await axios.post(`${SERVER_URI}/api/chat`, { room: partnerSocketId, name: 'hi' })
          .catch(e => {
            console.log(e)
          })
        this.socket.emit('accept-match', this.matchBy, partnerSocketId)
        this.$router.push({
          name: 'codingroom',
          params: {
            socket: this.socket,
            id: partnerSocketId
          }
        })
      })
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
    }
  }
}
</script>
