<template>
  <div class="row justify-content-center">
    <b-row>
      <b-col align-self="start">&nbsp;</b-col>
      <b-col cols="6" align-self="center">
        <h3 class="text-center">Add Room</h3>
        <b-form @submit="onSubmit">
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Room Name">
            <b-form-input id="room_name" v-model.trim="room.room_name" placeholder="Java" required></b-form-input>
          </b-form-group>
          <div class="form-group justify-content-center d-flex">
            <b-button class="addButton btn-success mt-4 mb-2 px-5" type="submit">Add</b-button>
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
      axios.post(`${SERVER_URI}/api/rooms`, this.room)
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

<style>
.addButton {
  color: black;
  background-color: #ffa8a1;
  outline-color: #ffa8a1;
  border-color: #ffa8a1;
}

.addButton:hover {
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
