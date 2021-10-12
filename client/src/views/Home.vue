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
