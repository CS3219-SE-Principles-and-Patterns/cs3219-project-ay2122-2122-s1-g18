<template>
  <div class="row justify-content-center">
    <h3 class="heading">Difficulty Level</h3>
    <b-form class='selectButtons mt-3' @submit="onSubmit">
      <b-form-radio-group
        id="difficultyButtons"
        v-model="selected"
        :options="difficultyOptions"
        name="difficultyButtons"
        buttons
        stacked
      />
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
      selected: '',
      difficultyOptions: [
        { text: 'Beginner', value: 'beginner' },
        { text: 'Intermediate', value: 'intermediate' },
        { text: 'Expert', value: 'expert' }
      ]
    }
  },
  beforeCreate () {
    const apiURL = `${SERVER_URI}/api/users/verify/checkAuth`
    axios.get(apiURL, { headers: authHeader() })
      .then((result) => {
        console.log(result)
      })
      .catch(() => {
        this.$router.push({
          name: 'login'
        })
      })
  },
  methods: {
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
