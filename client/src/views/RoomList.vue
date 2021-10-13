<template>
  <div class="col-lg-12">
    <b-row>
      <b-col align-self="start">&nbsp;</b-col>
        <h3 class="text-center">Room List</h3>
        <table class="table table-striped">
          <thead class="thead-dark">
            <tr class="tr">
              <th>Room Name</th>
              <th>Date Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr class="tr" v-for="room in rooms" :key="room._id">
              <td>{{ room.room_name }}</td>
              <td>{{ room.created_date }}</td>
              <td>
                <button @click="join(room._id)" class="btn btn-success">Join</button>
              </td>
            </tr>
          </tbody>
        </table>
        <b-button variant="link" :to="{name: 'addroom'}" class="link justify-content-center d-flex">Add a New Room</b-button>
      <b-col align-self="end">&nbsp;</b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios'
import { SERVER_URI } from '../constants'

export default {
  name: 'roomlist',
  data () {
    return {
      rooms: []
    }
  },
  created () {
    axios.get(`${SERVER_URI}/api/rooms`)
      .then(response => {
        this.rooms = response.data.data
      })
      .catch(e => {
        this.errors.push(e)
      })
  },
  methods: {
    join (id) {
      this.$router.push({
        name: 'joinroom',
        params: { id: id }
      })
    }
  }
}
</script>

<style>
.table {
  margin-top: 20px;
  margin-bottom: 25px;
}

.link {
  color: #5f8195;
}

.link:hover {
  color: #b3c3ce;
}
</style>
