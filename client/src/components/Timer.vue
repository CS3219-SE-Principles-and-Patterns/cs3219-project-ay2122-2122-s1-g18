// Adapted from https://medium.com/js-dojo/how-to-create-an-animated-countdown-timer-with-vue-89738903823f
<template>
  <div class='timer'>
    <svg class='timer__svg' viewBox='0 0 100 100'>
      <g class='timer__circle'>
        <circle class='timer__path-elapsed' cx='50' cy='50' :r='TIMER_RADIUS' />
        <path
          :stroke-dasharray='timeLeftCircle'
          class='timer__path-remaining'
          d='
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          '
        />
      </g>
    </svg>
    <span class='timer__label'>{{ formattedTimeLeft }}</span>
  </div>
</template>

<script>
const TIMER_RADIUS = 45
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS

const initTimer = () => {
  return {
    timePassed: 0,
    timerInterval: null
  }
}

export default {
  props: ['timeLimit'],

  data () {
    return initTimer()
  },

  computed: {
    timeLeft () {
      return this.timeLimit - this.timePassed
    },

    timeFraction () {
      const rawTimeFraction = this.timeLeft / this.timeLimit
      return rawTimeFraction - (1 - rawTimeFraction) / this.timeLimit
    },

    timeLeftCircle () {
      return `${(this.timeFraction * TIMER_CIRCUMFERENCE).toFixed(0)} ${TIMER_CIRCUMFERENCE}`
    },

    formattedTimeLeft () {
      const timeLeft = this.timeLeft
      const minutes = Math.floor(timeLeft / 60)
      let seconds = timeLeft % 60

      if (seconds < 10) {
        seconds = `0${seconds}`
      }

      return `${minutes}:${seconds}`
    }
  },

  watch: {
    timeLeft (newValue) {
      if (newValue <= 0) {
        this.stopTimer()
      }
    }
  },

  mounted () {
    this.startTimer()
  },

  methods: {
    startTimer () {
      this.timerInterval = setInterval(() => (this.timePassed += 1), 1000)
    },

    stopTimer () {
      clearInterval(this.timerInterval)
      this.$emit('timesUp')
    },

    restartTimer () {
      Object.assign(this.$data, initTimer())
      this.startTimer()
    }
  }
}
</script>

<style scoped lang='scss'>
.timer {
  position: relative;
  width: 250px;
  height: 250px;

  &__svg {
    transform: scaleX(-1);
  }

  &__circle {
    fill: none;
    stroke: none;
  }

  &__path-elapsed {
    stroke-width: 7px;
    stroke: #b3c3ce;
  }

  &__path-remaining {
    stroke-width: 7px;
    stroke-linecap: round;
    transform: rotate(90deg);
    transform-origin: center;
    transition: 1s linear all;
    fill-rule: nonzero;
    stroke: currentColor;
    color: #5f8195;
  }

  &__label {
    position: absolute;
    width: 250px;
    height: 250px;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
  }
}
</style>
