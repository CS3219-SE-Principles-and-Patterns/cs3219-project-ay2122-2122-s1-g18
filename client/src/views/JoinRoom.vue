<template>
  <b-row>
    <b-col cols="6">
      <h2>
        Join Room
        <b-link href="/room-list">(Room List)</b-link>
      </h2>
      <b-form @submit="onSubmit">
        <b-form-group id="fieldsetHorizontal"
                  horizontal
                  :label-cols="4"
                  breakpoint="md"
                  label="Enter Name">
          <b-form-input id="name" v-model.trim="chat.name" required></b-form-input>
        </b-form-group>
        <b-button type="submit" class="btn btn-success w-100">Join</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>
import axios from 'axios'
import * as io from 'socket.io-client'
import { SERVER_URI } from '../constants'

export default {
  name: 'joinroom',
  data () {
    return {
      chat: {},
      socket: io('http://localhost:4000')
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      this.chat.room = this.$route.params.id
      this.chat.message = this.chat.name + ' joined the room'
      axios.post(`${SERVER_URI}/api/chat`, this.chat)
        .then(response => {
          this.socket.emit('save-message', {
            room: this.chat.room,
            name: 'PeerPrep Bot',
            message: this.chat.name + ' joined this room',
            created_date: new Date()
          })
          this.$router.push({
            name: 'chatroom',
            params: {
              id: this.$route.params.id,
              name: response.data.data.name
            }
          })
        })
        .catch(e => {
          this.errors.push(e)
        })
    }
  }
}
</script>
