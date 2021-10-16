<template>
  <div>
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
// TODO: allow access only if authenticated
import axios from 'axios'
import authHeader from '../utils/authHeader'
import { SERVER_URI } from '../constants'

export default {
  name: 'home',
  data () {
    return {
      selected: [],
      fields: [
        { key: 'difficulty', thStyle: { display: 'none' } },
        { key: 'hasWaitingUser', thStyle: { display: 'none' } }
      ],
      difficultyOptions: [
        { key: 'beginner', difficulty: 'Beginner', hasWaitingUser: true },
        { key: 'intermediate', difficulty: 'Intermediate', hasWaitingUser: true },
        { key: 'expert', difficulty: 'Expert', hasWaitingUser: false }
      ]
    }
  },
  beforeCreate () {
    const apiURL = `${SERVER_URI}/api/users/verify/checkAuth`
    axios.get(apiURL, { headers: authHeader() })
      .catch(() => {
        this.$router.push({
          name: 'login'
        })
      })
  },
  methods: {
    onDifficultySelected (selected) {
      this.selected = selected[0].key
    },

    onSubmit (event) {
      event.preventDefault()
      this.$router.push({
        name: 'matching',
        params: {
          matchBy: this.selected
        }
      })
    }
  }
}
</script>
