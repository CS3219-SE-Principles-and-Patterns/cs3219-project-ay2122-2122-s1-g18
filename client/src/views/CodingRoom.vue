<template>
  <div>
    <b-row>
      <b-col>
        <b-button
          @click.prevent="handleNextQuestionButtonClick()"
          type="button"
          class="nextQuestionButton px-4 mb-5"
          :disabled="isSecondQuestion"
        >
          Next Coding Question
        </b-button>
      </b-col>
      <b-col>
        <h3 class="text-center mb-5">TIMER PLACEHOLDER</h3>
      </b-col>
      <b-col>
        <b-button variant="danger" @click.prevent="leaveRoom()" type="button" class="endButton px-4 float-end mb-5">
          End Session
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6">
        <h3 class="heading">Code Editor</h3>
        <b-form-textarea
            class="text-area panel-body-left"
            @input="updateCode"
            v-model="code"
            placeholder="Type your code here..."
            v-chat-scroll
        >
          <p>{{code}}</p>
        </b-form-textarea>
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
              <div class="right clearfix" v-if="item.name === name">
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
                    <b-badge class="badge" v-if="item.name !== 'PeerPrep Bot'">
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
import axios from 'axios'
import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
import { SERVER_URI } from '@/constants'

Vue.use(VueChatScroll)

export default {
  name: 'codingroom',
  data () {
    return {
      chats: [],
      room: this.$route.params.id,
      name: this.$route.params.name,
      socket: this.$route.params.socket,
      isInterviewer: this.$route.params.isInterviewer,
      message: '',
      code: '',
      interviewQuestions: null,
      isSecondQuestion: false
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
      name: 'PeerPrep Bot',
      message: this.name + ' joined this room',
      timestamp: this.getTimeNow()
    }
    this.sendChat(joinRoomChat)
    this.sendAssignedRoleChat()

    this.socket.on('new-chat', (chat) => this.chats.push(chat))

    this.socket.on('new-code', (code) => {
      this.code = code
    })

    this.socket.on('next-question', () => this.loadNextCodingQuestion())
  },
  methods: {
    getTimeNow () {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },

    getChat (message) {
      return {
        room: this.room,
        name: this.name,
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
        name: 'PeerPrep Bot',
        message: `Your role for this coding question is ${role}`,
        timestamp: this.getTimeNow(),
        isPrivate: true
      }
      this.sendChat(assignedRoleChat)
    },

    handleNextQuestionButtonClick () {
      this.socket.emit('load-next-question', this.room)
    },

    loadNextCodingQuestion () {
      this.isInterviewer = !this.isInterviewer
      this.sendAssignedRoleChat()
      this.clearCode()
      this.isSecondQuestion = true
    },

    leaveRoom () {
      if (window.confirm('Do you really want to end the session?')) {
        const leaveRoomChat = {
          room: this.room,
          name: 'PeerPrep Bot',
          message: this.name + ' left this room',
          timestamp: this.getTimeNow()
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
      this.code = evt
      this.socket.emit('update-code', {
        room: this.room,
        code: this.code
      })
    },

    clearCode () {
      this.code = ''
      this.socket.emit('update-code', {
        room: this.room,
        code: this.code
      })
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

  .badge {
    background-color: #5ab4dd;
    margin: 5px;
  }
</style>
