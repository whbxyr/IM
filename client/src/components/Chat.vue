<template>
  <div>
    <div class="ctn">
      <input v-model="uid" class="text">
      <div :class="status === 'beforeLogin' ? 'status' : 'status active'">
        {{status === 'beforeLogin' ? '未登录' : '已登录'}}
      </div>
      <div class="connect" @click="connect">
        {{status === 'beforeLogin' ? '连接 websocket' : '断开 websocket'}}
      </div>
      <div class="session">
        <div class="send-btn" @click="sendMsg">发送消息</div>
      </div>
    </div>
  </div>
</template>

<script>
import ws from 'websocket';

export default {
  name: 'Chat',
  data () {
    return {
      status: 'beforeLogin',
      uid: null,
      client: null
    }
  },
  methods: {
    connect () {
      if (this.status === 'beforeLogin') {
        let uid = this.uid
        if (!uid) {
          console.log('need uid')
          return
        }
        let client = new ws.w3cwebsocket('ws://localhost:8000/', 'echo-protocol')
        this.client = client
        client.onopen = () => {
          this.status = 'logined'
          let msg = JSON.stringify({
            uid,
            content: `用户 ${uid} 进房间了`
          })
          client.send(msg)
        }
        client.onclose = () => {
          this.status = 'beforeLogin'
        }
        client.onmessage = (e) => {
          alert(e.data)
        }
      } else {
        this.disConnect()
      }
    },
    disConnect () {
      this.client.close()
    },
    sendMsg () {
      let uid = this.uid
      if (!uid) {
        console.log('need uid')
        return
      }
      let msg = JSON.stringify({
        uid,
        content: `用户 ${uid} 发送了一条消息`
      })
      this.client.send(msg)
    }
  },
  mounted () {
  }
}
</script>

<style lang="stylus">
.ctn
  width 400px
  margin 0 auto
  position relative
  .text
    float left
  .status
    height 20px
    line-height 20px
    position absolute
    top -24px
    left 0
    background #f00
    &.active
      background #0f0
  .connect
    cursor pointer
  .session
    .send-btn
      cursor pointer
      float left
      margin-left 10px
</style>
