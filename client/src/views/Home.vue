<template>
  <div>
    <h2 class="mb-3">Welcome back, {{ username }}!</h2>
    <b-row>
      <b-col class="mt-3" align="center">
        <h3 class="heading mb-4">Difficulty Levels</h3>
        <b-table
            class="table"
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
        <b-form class='selectButtons mt-3' @submit="onSubmit">
          <div class="form-group justify-content-center d-flex">
            <b-button class="mt-4 mb-2 px-5" type='submit'>
              Find a Match
            </b-button>
          </div>
        </b-form>
        <b-alert :show="error" variant="danger">
          {{ errorMessage }}
        </b-alert>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'
import { SERVER_URI } from '../constants'
import getAuthHeader from '../utils/authHeader'

const UNEXPECTED_ERROR = 'We are unable to find you a match at the moment. Please try again later.'

export default {
  name: 'home',
  data () {
    return {
      username: JSON.parse(sessionStorage.getItem('username')),
      socket: null,
      waitingUsers: null,
      selected: null,
      error: false,
      errorMessage: null,
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
      if (selected.length <= 0) {
        this.selected = null
        return
      }
      this.selected = selected[0].key
    },

    async onSubmit (event) {
      event.preventDefault()
      this.error = false
      if (!this.selected) {
        this.setError('Please select a difficulty level for the coding question(s) you wish to attempt.')
        return
      }

      const hasOngoingSession = await this.doesUserHaveOngoingSession()
      if (hasOngoingSession) {
        this.setError('You already have an ongoing session.')
        return
      }

      this.$router.push({
        name: 'matching',
        params: {
          matchBy: this.selected
        }
      })
    },

    async doesUserHaveOngoingSession () {
      const url = `${SERVER_URI}/api/users/${this.username}/session`
      return axios.get(url, { headers: getAuthHeader() })
        .then((response) => {
          return response.data.hasOngoingSession
        })
        .catch(() => this.setError(UNEXPECTED_ERROR))
    },

    setError (message) {
      this.error = true
      this.errorMessage = message
    }
  }
}
</script>

<style>
.table {
  width: 500px;
}
</style>
