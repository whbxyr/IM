<template>
  <div>
    <!-- 登录部分 -->
    <el-form v-if="status === 'beforeLogin'" :model="userData" label-width="100px" class="login-ctn">
      <el-form-item label="用户 id">
        <el-input v-model="userData.uid" placeholder="请输入用户 id"></el-input>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="userData.uname" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">进入聊天室</el-button>
      </el-form-item>
    </el-form>
    <!-- 聊天室部分 -->
    <div v-if="status === 'logined'">{{JSON.stringify(history)}}</div>
  </div>
</template>

<script>
import ws from 'websocket';
import localforage from 'localforage';

export default {
  name: 'Chat',
  data () {
    return {
      userData: {
        uid: '',
        uname: '',
      },
      status: 'beforeLogin',
      client: null,
      history: null
    }
  },
  methods: {
    login () {
      if (this.status === 'beforeLogin') {
        let { uid, uname } = this.userData
        if (!uid || !uname) {
          this.$notify({
            title: '提示',
            message: '请输入完整的用户信息',
            showClose: false
          })
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
          localforage.getItem('message').then(history => {
            this.history = history
          })
        }
        client.onclose = () => {
          this.status = 'beforeLogin'
        }
        client.onmessage = (e) => {
          this.setMsg({
            content: e.data
          })
        }
      }
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
      this.setMsg(JSON.parse(msg))
    },
    async setMsg(msg) {
      let oldMsg = await localforage.getItem('message');
      if (!oldMsg) {
        oldMsg = []
      }
      oldMsg.push(msg)
      await localforage.setItem('message', oldMsg)
    }
  },
  mounted () {
    localforage.getItem('message').then(value => {
      console.log(value)
    })
  }
}
</script>

<style lang="stylus">
.login-ctn
  width 300px
  height 300px
  margin 0 auto
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
