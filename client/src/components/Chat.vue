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
    <div v-if="status === 'logined'" class="room-ctn">
      <div v-for="(item, index) in history" :key="index"
        :class="item.uid === userData.uid ? 'right' : 'left'">
        用户 {{item.uid}} : {{item.content}}
      </div>
      <el-input class="input-ctn" v-model="msg" placeholder="输入聊天内容" @blur="sendMsg"></el-input>
    </div>
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
      history: [],
      msg: ''
    }
  },
  methods: {
    login () {
      if (this.status === 'beforeLogin') {
        let { uid, uname } = this.userData
        // 用户 id 以及用户名必传，否则弹出提示
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
            content: `用户 ${uid} 进房间了`,
            time: +new Date
          })
          client.send(msg)
          localforage.getItem('message').then(history => {
            if (history) {
              this.history.push(...history)
            }
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
    // 发送信道消息
    async sendMsg () {
      let msg = {
        uid: this.userData.uid,
        content: this.msg,
        time: +new Date
      }
      this.client.send(JSON.stringify(msg))
      // 将消息同步到 IndexedDB 中
      await this.setMsg(msg)
      this.history.push(msg)
    },
    // 将消息保存到 IndexedDB 中
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
    // 页面加载完成时从 IndexedDB 中取出数据
    localforage.getItem('message').then(value => {
      console.log(value)
    })
  }
}
</script>

<style lang="stylus">
html, body
  width 100%
  height 100%
  margin 0
  padding 0
.login-ctn
  width 300px
  height 300px
  margin 60px auto
.room-ctn
  position fixed
  width 100%
  height 100%
  margin 0 atuo
  .left
    text-align left
  .right
    text-align right
  .input-ctn
    position absolute
    bottom 0
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
