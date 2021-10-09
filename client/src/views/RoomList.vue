<template>
    <div class="row">
        <div class="col-md-12">
          <h2>
            Room List
            <b-link href="/add-room">(Add Room)</b-link>
          </h2>
            <table class="table table-striped">
                <thead class="thead-dark">
                    <tr>
                        <th>Room Name</th>
                        <th>Date Created</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="room in rooms" :key="room._id">
                        <td>{{ room.room_name }}</td>
                        <td>{{ room.created_date }}</td>
                        <td>
                            <button @click="join(room._id)" class="btn btn-success">Join</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
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
    axios.get(`${SERVER_URI}/api/room`)
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
