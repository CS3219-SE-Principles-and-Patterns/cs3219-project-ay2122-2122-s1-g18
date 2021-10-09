<template>
  <b-row>
    <b-col align-self="start">&nbsp;</b-col>
    <b-col cols="6" align-self="center">
      <h2>
        Add Room
        <b-link href="/room-list">(Room List)</b-link>
      </h2>
      <b-form @submit="onSubmit">
        <b-form-group id="fieldsetHorizontal"
                  horizontal
                  :label-cols="4"
                  breakpoint="md"
                  label="Enter Room Name">
          <b-form-input id="room_name" v-model.trim="room.room_name" required></b-form-input>
        </b-form-group>
        <button class="btn btn-success w-100">Add</button>
      </b-form>
    </b-col>
    <b-col align-self="end">&nbsp;</b-col>
  </b-row>
</template>

<script>
import axios from 'axios'
import { SERVER_URI } from '../constants'

export default {
  name: 'addroom',
  data () {
    return {
      room: {}
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      axios.post(`${SERVER_URI}/api/room`, this.room)
        .then(response => {
          this.$router.push({
            name: 'roomlist'
          })
        })
        .catch(e => {
          this.errors.push(e)
        })
    }
  }
}
</script>
