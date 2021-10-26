<template>
  <div>
    <b-row>
      <b-col>
        <b-button
          id="nextQuestionButton"
          @click.prevent="handleNextQuestionButtonClick()"
          type="button"
          class="nextQuestionButton px-4 mb-5"
          :disabled="isSecondQuestion"
        >
          Next Coding Question
        </b-button>
        <b-tooltip class="tooltip" target="nextQuestionButton" triggers="hover" ref="tooltip">
          Upon clicking this button,<br>
          1. Your role will be swapped<br>
          2. The current code will be cleared<br>
          3. You will receive a new coding question<br>
          4. The timer will be reset<br>
        </b-tooltip>
      </b-col>
      <b-col>
        <b-col>
          <div class='container d-flex justify-content-center'>
            <CountUpTimer ref='countUpTimer'/>
          </div>
        </b-col>
        <b-col>
          <div class='container d-flex justify-content-center'>
            <p style="color:brown">{{recommended_time}}</p>
          </div>
        </b-col>
      </b-col>
      <b-col>
        <b-button variant="danger" @click.prevent="leaveRoom()" type="button" class="endButton px-4 float-end mb-5">
          End Session
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
        <h3 class="heading">Coding Question</h3>
        <div class="scroll-box">
          <p style="color: green; font-size:22px;">{{codingQuestion.question_title}}</p>
          <p class="pre-formatted" style="font-size:16px;">{{codingQuestion.question_text}}</p>
          <p>{{codingQuestion.url}}</p>
        </div>
          <!-- <p style="color: green; font-size:22px;">{{codingQuestion.question_title}}</p>
          <p class="pre-formatted" style="font-size:16px;">{{codingQuestion.question_text}}</p>
          <p>{{codingQuestion.url}}</p> -->

      </b-col>
      <b-col cols="5">
        <h3 class="heading">Code Editor</h3>
        <b-form-textarea
          class="text-area panel-body-left"
          @input="updateCode"
          v-model="code"
          placeholder="Type your code here..."
          v-chat-scroll
        />
      </b-col>
      <b-col>
        <b-col class="panel panel-primary">
          <b-row class="panel-heading" align-v="start" align-h="between">
            <b-col>
              <h3 class="heading">Chat</h3>
            </b-col>
            <b-col>
              <b-dropdown
                class="float-end"
                right
                text="Send Interview Question"
                v-if="isInterviewer"
              >
                <b-dropdown-item
                  v-for="question in interviewQuestions"
                  :key="question._id"
                  @click.prevent="sendChat(getChat(question.text))"
                >
                  {{ question.text }}
                </b-dropdown-item>
              </b-dropdown>
            </b-col>
          </b-row>
          <div class="panel-body-right" v-chat-scroll>
            <b-list-group-item v-for="item in chats" class="chat" :key="item.id">
              <div class="right clearfix" v-if="item.name === username">
                <div class="chat-body clearfix">
                  <div class="header">
                    <strong class="primary-font">{{ item.name }}</strong>
                    <b-badge class="badge">{{ isInterviewer? 'Interviewer' : 'Interviewee' }}</b-badge>
                    <small class="pull-right text-muted">
                      <span class="glyphicon glyphicon-time" />
                      {{ item.timestamp }}
                    </small>
                  </div>
                  <p>{{ item.message }}</p>
                </div>
              </div>
              <div class="left clearfix" v-else>
                <div class="chat-body clearfix">
                  <div class="header">
                    <strong class="primary-font">{{ item.name }}</strong>
                    <b-badge class="badge" v-if="item.name !== 'SHReK Tech Bot'">
                      {{ isInterviewer? 'Interviewee' : 'Interviewer' }}
                    </b-badge>
                    <small class="pull-right text-muted">
                      <span class="glyphicon glyphicon-time" />
                      {{ item.timestamp }}
                    </small>
                  </div>
                  <p>{{ item.message }}</p>
                </div>
              </div>
            </b-list-group-item>
            <small class="text-muted" v-if="typing">{{ matchedUser }} is typing...</small>
          </div>
        </b-col>
        <b-form @submit="onSendMessage" class="chat-form">
          <b-input-group>
            <b-form-input
                id="message"
                class="chat-form-element"
                v-model.trim="message"
                placeholder="Chat here..."
                required
            />
            <b-input-group-append>
              <b-btn class="chat-form-element" type="submit" variant="primary">Send</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Automerge from 'automerge'
import axios from 'axios'
import io from 'socket.io-client'
import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
import CountUpTimer from '../components/CountUpTimer'
import { SERVER_URI } from '../constants'

Vue.use(VueChatScroll)

export default {
  name: 'codingroom',

  components: {
    CountUpTimer
  },

  data () {
    return {
      chats: [],
      room: this.$route.params.id,
      name: this.$route.params.name,
      socket: this.$route.params.socket,
      isInterviewer: this.$route.params.isInterviewer,
      username: sessionStorage.getItem('username').split('"')[1],
      matchedUser: '',
      typing: false,
      message: '',
      code: '',
      automergeCode: null,
      interviewQuestions: null,
      isSecondQuestion: false,
      difficulty: this.$route.params.difficulty,
      recommended_time: '',
      codingQuestion: '',
      codingQuestion2: '',
      codingQuestionIdx: this.$route.params.codingQuestionIdx,
      codingQuestionIdx2: this.$route.params.codingQuestionIdx2

    }
  },

  watch: {
    message (value) {
      const message = {
        room: this.room,
        user: this.username
      }
      value ? this.socket.emit('typing', message) : this.socket.emit('stop-typing', this.room)
    }
  },

  beforeCreate () {
    const url = `${SERVER_URI}/api/interview-questions`
    axios.get(url)
      .then((response) => {
        this.interviewQuestions = response.data.data
      })
  },

  created () {
    const joinRoomChat = {
      room: this.room,
      name: 'SHReK Tech Bot',
      message: this.username + ' joined this room',
      timestamp: this.getTimeNow()
    }
    this.sendChat(joinRoomChat)
    this.sendAssignedRoleChat()

    this.initialiseAutomergeCode()

    this.socket.on('typing', (user) => {
      this.matchedUser = user
      this.typing = true
    })

    this.socket.on('stop-typing', () => {
      this.matchedUser = ''
      this.typing = false
    })

    this.socket.on('new-chat', (chat) => {
      this.chats.push(chat)
      if (chat.left) {
        this.typing = false
      }
    })

    this.socket.on('new-code', (codeChanges) => {
      if (codeChanges && codeChanges.length > 0) {
        const formattedChanges = [new Uint8Array(codeChanges[0])]
        let _patch
        [this.automergeCode, _patch] = Automerge.applyChanges(this.automergeCode, formattedChanges)
        this.code = this.automergeCode.code
      }
    })

    var codingQuestionsURL = ''
    console.log(this.difficulty)
    if (this.difficulty === 'beginner') {
      this.recommended_time = 'Recommended: 00:30:00'
      codingQuestionsURL = `${SERVER_URI}/api/easy-coding-questions`
    } else if (this.difficulty === 'intermediate') {
      this.recommended_time = 'Recommended: 00:45:00'
      codingQuestionsURL = `${SERVER_URI}/api/medium-coding-questions`
    } else {
      this.recommended_time = 'Recommended: 1:00:00'
      codingQuestionsURL = `${SERVER_URI}/api/hard-coding-questions`
    }
    axios.get(codingQuestionsURL)
      .then((response) => {
        console.log(this.codingQuestionIdx)
        console.log(response.data.data)
        this.codingQuestion = response.data.data[this.codingQuestionIdx]
        // console.log(this.codingQuestion)

        this.codingQuestion2 = response.data.data[this.codingQuestionIdx2]
      })

    this.socket.on('next-question', () => this.loadNextCodingQuestion())
  },

  mounted () {
    this.addListeners()
  },

  destroyed () {
    this.removeListeners()
  },

  methods: {
    initialiseAutomergeCode () {
      if (!this.isInterviewer) {
        this.automergeCode = Automerge.init()
        return
      }

      this.automergeCode = Automerge.from({ code: '' })
      const changes = Automerge.getAllChanges(this.automergeCode)
      this.socket.emit('update-code', {
        room: this.room,
        codeChanges: changes
      })
    },

    addListeners () {
      window.addEventListener('popstate', this.popStateListener)
      window.addEventListener('beforeunload', this.beforeUnloadListener)
    },

    removeListeners () {
      window.removeEventListener('popstate', this.popStateListener)
      window.removeEventListener('beforeunload', this.beforeUnloadListener)
    },

    popStateListener () {
      alert('You cannot rejoin this room anymore!')
      this.socket = io(SERVER_URI)
      const leaveRoomChat = {
        room: this.room,
        name: 'SHReK Tech Bot',
        message: this.username + ' left this room',
        timestamp: this.getTimeNow()
      }
      this.sendChat(leaveRoomChat)
      this.$router.push({
        name: 'home'
      })
    },

    beforeUnloadListener (e) {
      // TODO: allow realtime communication again
      e.preventDefault()
      e.returnValue = ''
      if (window.closed) {
        console.log('Window closed')
      } else {
        console.log('Window not closed')
      }
    },

    getTimeNow () {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },

    getChat (message) {
      return {
        room: this.room,
        name: this.username,
        message,
        timestamp: this.getTimeNow()
      }
    },

    sendChat (chat) {
      this.socket.emit('send-chat', chat)
    },

    sendAssignedRoleChat () {
      const role = this.isInterviewer ? 'INTERVIEWER' : 'INTERVIEWEE'
      const assignedRoleChat = {
        room: this.room,
        name: 'SHReK Tech Bot',
        message: `Your role for this coding question is ${role}`,
        timestamp: this.getTimeNow(),
        isPrivate: true
      }
      this.sendChat(assignedRoleChat)
    },

    handleNextQuestionButtonClick () {
      this.$refs.tooltip.$emit('close')
      this.socket.emit('load-next-question', this.room)
    },

    loadNextCodingQuestion () {
      this.$refs.countUpTimer.reset()
      this.isInterviewer = !this.isInterviewer
      this.sendAssignedRoleChat()
      this.clearCode()
      this.isSecondQuestion = true
      this.codingQuestion = this.codingQuestion2
      this.typing = false
      this.message = ''
    },

    leaveRoom () {
      if (window.confirm('Do you really want to end the session?')) {
        const leaveRoomChat = {
          room: this.room,
          name: 'SHReK Tech Bot',
          message: this.username + ' left this room',
          timestamp: this.getTimeNow(),
          left: true
        }
        this.sendChat(leaveRoomChat)
        this.$router.push({
          name: 'home'
        })
      }
    },

    onSendMessage (evt) {
      evt.preventDefault()
      this.sendChat(this.getChat(this.message))
      this.message = ''
    },

    updateCode (evt) {
      const newCode = Automerge.change(this.automergeCode, `Edit by ${this.username}`, (doc) => {
        doc.code = evt
      })
      const changes = Automerge.getChanges(this.automergeCode, newCode)
      this.automergeCode = newCode
      this.socket.emit('update-code', {
        room: this.room,
        codeChanges: changes
      })
    },

    clearCode () {
      this.code = ''
      this.updateCode('')
    }
  }
}
</script>

<style>
  .chat .left .chat-body {
    text-align: left;
  }

  .chat .right .chat-body {
    text-align: right;
  }

  .chat .chat-body p {
    margin: 0;
    font-size: 16px;
  }

  .panel-body-left {
    overflow-y: scroll;
    height: 500px;
  }

  .panel-body-right {
    overflow-y: scroll;
    height: 460px;
  }

  .chat-form {
    margin-bottom: 20px;
    width: 100%;
  }

  .chat-form-element {
    height: 40px;
  }

  .heading {
    margin-bottom: 18px;
  }

  .text-area {
    font-size: 16px;
    font-family: 'Courier New', Courier, monospace;
  }

  .nextQuestionButton {
    background-color: #5ab4dd;
    outline-color: #5ab4dd;
    border-color: #5ab4dd;
  }

  .nextQuestionButton:hover {
    background-color: #4493b8;
    outline-color: #4493b8;
    border-color: #4493b8;
  }

  .tooltip-inner {
    text-align: left;
    max-width: 300px;
  }

  .badge {
    background-color: #5ab4dd;
    margin: 5px;
  }

  .pre-formatted {
    white-space: pre-wrap
  }

  .scroll-box {
    background: #f4f4f4;
    border: 2px solid rgba(0, 0, 0, 0.1);
    height: 500px; /* maximum height of the box, feel free to change this! */
    padding: 15px;
    overflow-y: scroll;
}
</style>
