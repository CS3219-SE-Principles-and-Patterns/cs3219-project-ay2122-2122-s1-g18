<template>
  <div>
    <h2 class="mb-5">Welcome back, {{ username }}!</h2>
    <h3 class="heading">Difficulty Level</h3>
    <b-col class="mt-3" cols="3">
      <b-table
        :items="difficultyOptions"
        :fields="fields"
        select-mode="single"
        responsive="sm"
        ref="selectableTable"
        selectable
        outlined
        @row-selected="onDifficultySelected"
      >
        <template #cell(hasWaitingUser)="data">
          <b-icon-person-check-fill
            v-if="data.item.hasWaitingUser"
            variant="success"
            class="h1"
          />
          <b-icon-person-check-fill
            v-else
            style="color: #c6c6c6;"
            class="h1"
          />
        </template>
      </b-table>
    </b-col>
    <b-form class='selectButtons mt-3' @submit="onSubmit">
      <div class="form-group justify-content-center d-flex">
        <b-button class="mt-4 mb-2 px-5" type='submit'>
          Find a Match
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import io from 'socket.io-client'
import { SERVER_URI } from '../constants'

export default {
  name: 'home',
  data () {
    return {
      username: sessionStorage.getItem('username').split('"')[1],
      socket: null,
      waitingUsers: null,
      selected: null,
      fields: [
        { key: 'difficulty', thStyle: { display: 'none' } },
        { key: 'hasWaitingUser', thStyle: { display: 'none' } }
      ]
    }
  },

  computed: {
    difficultyOptions () {
      return [{
        key: 'beginner',
        difficulty: 'Beginner',
        hasWaitingUser: this.waitingUsers ? this.waitingUsers.beginner : false
      }, {
        key: 'intermediate',
        difficulty: 'Intermediate',
        hasWaitingUser: this.waitingUsers ? this.waitingUsers.intermediate : false
      }, {
        key: 'expert',
        difficulty: 'Expert',
        hasWaitingUser: this.waitingUsers ? this.waitingUsers.expert : false
      }]
    }
  },
  created () {
    this.socket = io(SERVER_URI)
    this.socket.emit('join-waiting-users-listener')
    this.socket.on('update-waiting-users', (waitingUsers) => {
      this.waitingUsers = waitingUsers
    })
  },
  methods: {
    onDifficultySelected (selected) {
      this.selected = selected[0].key
    },

    onSubmit (event) {
      event.preventDefault()
      if (this.selected) {
        this.$router.push({
          name: 'matching',
          params: {
            matchBy: this.selected
          }
        })
      }
    }
  }
}
</script>
