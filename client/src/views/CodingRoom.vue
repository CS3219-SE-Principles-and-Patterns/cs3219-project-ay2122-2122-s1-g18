<template>
  <b-row>
    <b-col sm="12" lg="4" class="mb-5 px-3">
      <b-row>
        <b-col sm="12" lg="7">
          <h4 class="heading">Coding Question</h4>
        </b-col>
        <b-col sm="12" lg="5">
          <b-row>
            <b-button
              id="nextQuestionButton"
              @click.prevent="handleNextQuestionButtonClick()"
              type="button"
              float-end
              class="px-2"
              variant="dark"
              v-if="hasMatch"
              :disabled="isSecondQuestion"
            >
              Next Question
            </b-button>
            <b-tooltip
              class="tooltip"
              target="nextQuestionButton"
              triggers="hover"
              ref="tooltip"
              v-if="hasMatch"
              :disabled="isSecondQuestion"
            >
              Upon clicking this button,<br>
              1. Your role will be swapped<br>
              2. The current code will be cleared<br>
              3. You will receive a new coding question<br>
              4. The timer will be reset<br>
            </b-tooltip>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="scroll-box">
        <p style="color: #967d5e; font-size:22px; font-weight:600;">
          {{ codingQuestion.question_title }}
        </p>
        <p class="pre-formatted" style="font-size:15px;">{{ codingQuestion.question_text }}</p>
        <b-link :href="codingQuestion.url" style="font-size:15px;">
          {{ codingQuestion.url }}
        </b-link>
      </b-row>
    </b-col>
    <b-col sm="12" lg="4" class="mb-5 px-3">
      <h4 class="heading">Code Editor</h4>
      <b-form-textarea
        class="text-area panel-body-left"
        @input="updateCode"
        v-model="code"
        placeholder="Type your code here..."
        v-chat-scroll
      />
    </b-col>
    <b-col sm="12" lg="4" class="panel panel-primary mb-5 px-2">
      <b-row>
        <b-col sm="12" lg="7">
          <b-row class="mb-2">
            <div class="container d-flex justify-content-center">
              <CountUpTimer ref="countUpTimer"/>
            </div>
            <div class="container d-flex justify-content-center">
              <p style="color:brown; font-size:13px;">{{ recommendedTime }}</p>
            </div>
          </b-row>
        </b-col>
        <b-col sm="12" lg="5">
          <b-row>
            <b-button
              @click.prevent="leaveRoom()"
              type="button"
              class="mb-4"
              variant="warning"
            >
              End Session
            </b-button>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="panel-heading" align-v="start" align-h="between">
        <b-col>
          <h4 class="heading">Chat</h4>
        </b-col>
        <b-col>
          <b-dropdown
            class="float-end"
            right
            text="Send Interview Question"
            v-if="isInterviewer"
            variant="dark"
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
                <b-badge class="badge" v-if="hasMatch">
                  {{ isInterviewer ? "Interviewer" : "Interviewee" }}
                </b-badge>
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
                <b-badge class="badge" v-if="hasMatch && item.name !== 'SHReK Tech Bot'">
                  {{ isInterviewer ? "Interviewee" : "Interviewer" }}
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
            <b-btn class="chat-form-element" type="submit" variant="dark">Send</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>
import Automerge from 'automerge'
import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
import CountUpTimer from '../components/CountUpTimer'
import AXIOS, { getAuthHeader } from '../utils/axiosConfig'

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
      hasMatch: this.$route.params.hasMatch,
      socket: this.$route.params.socket,
      isInterviewer: this.$route.params.isInterviewer,
      username: JSON.parse(sessionStorage.getItem('username')),
      matchedUser: '',
      typing: false,
      message: '',
      code: '',
      automergeCode: null,
      interviewQuestions: null,
      isSecondQuestion: false,
      difficulty: this.$route.params.difficulty,
      recommendedTime: '',
      codingQuestion: '',
      codingQuestion1Id: this.$route.params.codingQuestion1Id,
      codingQuestion2Id: this.$route.params.codingQuestion2Id
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
    const url = '/api/interview-questions'
    AXIOS.get(url, { headers: getAuthHeader() })
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
    this.sendWarning()
    if (this.hasMatch) {
      this.sendAssignedRoleChat()
    }

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

    const codingQuestion1URL = `/api/coding-questions/${this.codingQuestion1Id}`
    AXIOS.get(codingQuestion1URL, { headers: getAuthHeader() })
      .then((response) => {
        this.codingQuestion = response.data.data
      })

    switch (this.difficulty) {
      case 'beginner':
        this.recommendedTime = 'Recommended: 00:30:00'
        break
      case 'intermediate':
        this.recommendedTime = 'Recommended: 00:45:00'
        break
      case 'expert':
        this.recommendedTime = 'Recommended: 01:00:00'
        break
      default:
        console.log('Unaccepted difficulty level.')
    }

    this.socket.on('next-question', () => this.loadNextCodingQuestion())
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

    getTimeNow () {
      return new Date().toLocaleTimeString([], { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' })
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

    sendWarning () {
      const warning = {
        room: this.room,
        name: 'SHReK Tech Bot',
        message: 'Please note that you cannot return to this session after leaving or refreshing the page.',
        timestamp: this.getTimeNow(),
        isPrivate: true
      }
      this.sendChat(warning)
    },

    handleNextQuestionButtonClick () {
      this.$refs.tooltip.$emit('close')
      this.socket.emit('load-next-question', this.room)
    },

    async loadNextCodingQuestion () {
      this.$refs.countUpTimer.reset()
      this.isInterviewer = !this.isInterviewer
      this.sendWarning()
      if (this.hasMatch) {
        this.sendAssignedRoleChat()
      }
      this.clearCode()
      const codingQuestion2URL = `/api/coding-questions/${this.codingQuestion2Id}`
      await AXIOS.get(codingQuestion2URL, { headers: getAuthHeader() })
        .then((response) => {
          this.codingQuestion = response.data.data
        })
      this.isSecondQuestion = true
    },

    leaveRoom () {
      if (window.confirm('Do you really want to end the session?')) {
        this.socket.disconnect()
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
    font-size: 15px;
  }

  .panel-body-left {
    overflow-y: scroll;
    height: 700px;
  }

  .panel-body-right {
    overflow-y: scroll;
    height: 575px;
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
    font-size: 15px;
    font-family: 'Courier New', Courier, monospace;
  }

  .tooltip-inner {
    text-align: left;
    max-width: 300px;
  }

  .badge {
    background-color: #967d5e;
    margin: 5px;
  }

  .pre-formatted {
    white-space: pre-wrap
  }

  .scroll-box {
    background: #f4f4f4;
    border: 2px solid rgba(0, 0, 0, 0.1);
    height: 700px;
    padding: 15px;
    overflow-y: scroll;
}
</style>
