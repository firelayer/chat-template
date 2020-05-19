<template>
  <div class="channel-page" :class="{ 'secondary': this.$vuetify.theme.dark }">
    <div id="messages" ref="messages" class="messages mx-2">

      <div ref="loadMore" v-scroll:#messages="onScroll" class="py-6"></div>

      <div class="text-center my-4">
        <v-progress-circular
          v-if="isLoadingPrev"
          :width="3"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>

      <transition-group name="list">
        <channel-message v-for="message in messages" :key="message.id" :message="message" class="my-4 d-flex" />
      </transition-group>
    </div>

    <div class="input-box pa-2">
      <input-box @send-message="sendMessage" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { throttle } from 'lodash'
import { realtime } from '../../firebase'
import InputBox from '../../components/chat/InputBox'
import ChannelMessage from '../../components/chat/ChannelMessage'

export default {
  components: {
    InputBox,
    ChannelMessage
  },
  data() {
    return {
      messages: [],
      isLoadingPrev: false,
      isLoadingMessages: true,
      isLastMesssage: false,
      isWaiting: false
    }
  },
  computed: {
    ...mapState('app', ['user']),
    ...mapState('channel', ['channel'])
  },
  watch: {
    '$route.params.id'() {
      this.startChannel(this.$route.params.id)
    }
  },
  created() {
    this.onScroll = throttle(this._onScroll, 100, {
      leading: true,
      trailing: false
    })
  },
  mounted() {
    this.startChannel(this.$route.params.id)
  },
  beforeDestroy() {
    this.unsubscribeChannel(this.channel)
  },
  methods: {
    ...mapActions('app', ['showError', 'showToast', 'showSuccess']),
    ...mapMutations('channel', {
      setChannel: 'SET_CHANNEL'
    }),
    startChannel(channelId) {
      this.messages = []
      this.isLoadingPrev = false
      this.isLoadingMessages = true
      this.isLastMesssage = false
      this.isWaiting = false

      // remove previous listeners
      this.unsubscribeChannel(this.channel)

      // set global
      this.setChannel(channelId)

      const messages = []

      realtime().ref(`messages/${channelId}`).orderByKey().limitToLast(15).on('child_added', (snapshot, prevChildKey) => {
        const doc = snapshot.val()

        this.messages.push({
          id: snapshot.key,
          ...snapshot.val()
        })

        if (this.$refs.messages.scrollTop + this.$refs.messages.clientHeight === this.$refs.messages.scrollHeight) {
          this.$nextTick(this.scrollToBottom)
        }

        this.isLoadingMessages = false
      })
    },
    async sendMessage(message) {
      try {
        this.scrollToBottom()

        await realtime().ref(`messages/${this.channel}`).push().set({
          name: this.user.displayName,
          text: message,
          timestamp: realtime.ServerValue.TIMESTAMP
        })
      } catch (error) {
        this.showError({ error })
      }
    },
    async loadPrevious() {
      if (this.isLoadingPrev || this.isLoadingMessages || this.messages.length === 0 || this.isLastMesssage) return

      this.isLoadingPrev = true
      this.isWaiting = true

      const lastMessageKey = this.messages[0].id

      realtime().ref(`messages/${this.channel}`).orderByKey().endAt(lastMessageKey).limitToLast(15).once('value', (snapshot) => {
        const oldMessages = []

        if (Object.keys(snapshot.val()).length < 15) {
          this.isLastMesssage = true
        }

        snapshot.forEach((childSnapshot) => {
          const doc = childSnapshot.val()

          if (lastMessageKey !== childSnapshot.key) {
            oldMessages.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            })
          }
        })

        const shouldScroll = this.$refs.messages.scrollTop + this.$refs.messages.clientHeight === this.$refs.messages.scrollHeight

        const previousScrollHeightMinusTop = this.$refs.messages.scrollHeight - this.$refs.messages.scrollTop

        setTimeout(() => { this.isWaiting = false }, 1000)
        this.messages = [...oldMessages, ...this.messages]

        if (shouldScroll) {
          this.scrollToBottom()
        } else {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight - previousScrollHeightMinusTop
        }

        this.isLoadingPrev = false
      })
    },
    unsubscribeChannel(channelId) {
      realtime().ref(`messages/${channelId}`).orderByKey().limitToLast(15).off()
    },
    _onScroll(e) {
      if (this.isWaiting || this.isLoadingPrev || this.isLoadingMessages) return

      const elem = this.$refs.loadMore
      const y = elem.getBoundingClientRect().top + elem.offsetHeight / 2

      if (y < 0 || y > this.$refs.messages.clientHeight) return

      this.loadPrevious()
    },
    scrollToBottom() {
      this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    }
  }
}
</script>
<style lang="scss" scoped>
.list-enter-active {
  transition: all 0.3s;
}

.list-move {
  transition: transform 0.3s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.channel-page {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;

  .messages {
    flex-grow: 1;
    margin-bottom: 60px;
    padding-bottom: 40px;
    overflow: auto;
    min-height: 0;
  }

  .input-box {
    position: fixed;
    bottom: 12px;
    width: 100%;
  }

  @media (min-width: 768px) {
    .messages {
      margin-bottom: 60px;
      padding-bottom: 0px;
    }

    .input-box {
      position: absolute;
      bottom: 12px;
    }
  }
}
</style>
