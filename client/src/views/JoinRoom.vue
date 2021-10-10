<template>
  <div class="row justify-content-center">
    <b-row>
      <b-col align-self="start">&nbsp;</b-col>
      <b-col cols="6">
        <h3 class="text-center">Join Room</h3>
        <b-form @submit="onSubmit">
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Your Name">
            <b-form-input id="name" v-model.trim="chat.name" placeholder="John Doe" required></b-form-input>
          </b-form-group>
          <div class="form-group justify-content-center d-flex">
            <b-button class="joinButton btn-success mt-4 mb-2 px-5" type="submit">Join Room</b-button>
          </div>
        </b-form>
        <b-button variant="link" :to="{name: 'roomlist'}" class="link justify-content-center d-flex">Back to Room List</b-button>
    </b-col>
    <b-col align-self="end">&nbsp;</b-col>
    </b-row>
  </div>
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
          this.socket.emit('save-chat', {
            room: this.chat.room,
            name: 'PeerPrep Bot',
            message: this.chat.name + ' joined this room',
            created_date: new Date()
          })
          this.$router.push({
            name: 'codingroom',
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

<style>
.joinButton {
  color: black;
  background-color: #ffa8a1;
  outline-color: #ffa8a1;
  border-color: #ffa8a1;
}

.joinButton:hover {
  color: black;
  background-color: #ffe5e3;
  outline-color: #ffe5e3;
  border-color: #ffe5e3;
}

.link {
  color: #5f8195;
}

.link:hover {
  color: #b3c3ce;
}
</style>
