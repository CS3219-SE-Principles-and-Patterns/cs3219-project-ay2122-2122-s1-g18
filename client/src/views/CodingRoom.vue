<template>
  <b-row>
    <b-col cols="6">
      <h3 class="heading">Code Editor</h3>
      <b-form-textarea class="text-area panel-body" @input="updateCode" v-model="code" placeholder="Type your code here..." v-chat-scroll>
        <p>{{code}}</p>
      </b-form-textarea>
    </b-col>
    <b-col cols="6">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h3 class="heading">Chat Box</h3>
        </div>
        <div class="panel-body" v-chat-scroll>
            <b-list-group-item v-for="item in chats" class="chat" :key="item.id">
              <div class="right clearfix" v-if="item.name === name">
                <div class="chat-body clearfix">
                  <div class="header">
                    <strong class="primary-font">{{ item.name }}</strong> <small class="pull-right text-muted">
                    <span class="glyphicon glyphicon-time"></span>{{ item.created_date }}</small>
                  </div>
                  <p>{{ item.message }}</p>
                </div>
              </div>
              <div class="left clearfix" v-else>
                <div class="chat-body clearfix">
                  <div class="header">
                    <strong class="primary-font">{{ item.name }}</strong> <small class="pull-right text-muted">
                    <span class="glyphicon glyphicon-time"></span>{{ item.created_date }}</small>
                  </div>
                  <p>{{ item.message }}</p>
                </div>
              </div>
            </b-list-group-item>
        </div>
      </div>
      <ul v-if="errors && errors.length">
        <li v-for="error of errors" v-bind:key="error">
          {{error.message}}
        </li>
      </ul>
      <b-form @submit="onSubmit" class="chat-form">
        <b-input-group prepend="Message">
          <b-form-input id="message" v-model.trim="chat.message" placeholder="Chat here..." required></b-form-input>
          <b-input-group-append>
            <b-btn type="submit" variant="primary">Send</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form>
    </b-col>
    <div class="form-group justify-content-center d-flex">
      <b-button variant="danger" @click.prevent="logout()" type="button" class="endButton ml-auto mt-4 mb-2 px-5">End Session</b-button>
    </div>
  </b-row>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import { SERVER_URI } from '../constants'
import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)

export default {
  name: 'codingroom',
  data () {
    return {
      chats: [],
      errors: [],
      name: this.$route.params.name,
      chat: {},
      socket: this.$route.params.socket,
      code: ''
    }
  },
  created () {
    axios.get(`${SERVER_URI}/api/chat/` + this.$route.params.id)
      .then(response => {
        this.chats = response.data.data || []
      })
      .catch(e => {
        this.errors.push(e)
      })
    this.socket.on('new-chat', function (data) {
      if (data.message.room === this.$route.params.id) {
        this.chats.push(data.message)
      }
    }.bind(this))
    this.socket.on('update-code', function (data) {
      if (data.room === this.$route.params.id) {
        this.code = data.message
      }
    }.bind(this))
  },
  methods: {
    logout () {
      if (window.confirm('Do you really want to end the session?')) {
        this.socket.emit('save-chat', {
          room: this.chat.room,
          name: 'PeerPrep Bot',
          message: this.chat.name + ' left this room',
          created_date: new Date()
        })
        this.$router.push({
          name: 'roomlist'
        })
      }
    },
    onSubmit (evt) {
      evt.preventDefault()
      this.chat.room = this.$route.params.id
      this.chat.name = this.$route.params.name
      axios.post(`${SERVER_URI}/api/chat`, this.chat)
        .then(response => {
          this.socket.emit('save-chat', response.data.data)
          this.chat.message = ''
        })
        .catch(e => {
          this.errors.push(e)
        })
    },
    updateCode (evt) {
      this.code = evt
      this.chat.room = this.$route.params.id
      this.socket.emit('new-code', {
        room: this.chat.room,
        message: this.code
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
    font-size: 18px;
  }

  .panel-body {
    overflow-y: scroll;
    height: 500px;
  }

  .chat-form {
    margin-bottom: 20px;
    width: 100%;
  }

  .heading {
    margin-bottom: 18px;
  }

  .text-area {
    font-size: 17px;
    font-family: 'Courier New', Courier, monospace;
  }
</style>
