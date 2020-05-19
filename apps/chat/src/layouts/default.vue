<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawerRight"
      app
      dark
      clipped
      :mobile-break-point="768"
      color="secondary darken-1"
      right
      width="180"
    >
      <v-list dense>
        <v-subheader class="ml-1 overline">Users Online ({{ users.length }})</v-subheader>
        <v-list-item v-for="item in users" :key="item.id" class="mb-1">
          <user-avatar :name="item.name" class="mr-1" />
          <v-list-item-content>
            <v-list-item-title :class="{ 'primary--text': item.id === user.uid }">{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      clipped-right
      flat
      dark
      color="primary"
      app
    >
      <v-app-bar-nav-icon class="hidden-lg-and-up" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="title font-weight-bold"># {{ channel }}</div>
      <v-spacer></v-spacer>
      <user-menu />
      <v-btn class="ml-2" icon @click.stop="drawerRight = !drawerRight"><v-icon>mdi-menu-open</v-icon></v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      app
      dark
      :mobile-break-point="768"
      floating
      class="elevation-4"
      color="secondary darken-1"
      width="240"
    >
      <div class="px-2 py-1 white--text">
        <div class="title font-weight-bold primary--text">Firelayer Chat</div>
        <div class="overline">1.0.0 Valiant | Alpha</div>
      </div>

      <v-list dense>
        <v-subheader class="ml-1 overline">Channels</v-subheader>
        <div class="mx-2 mb-2">
          <v-btn outlined small block @click="createDialog = true">
            <v-icon small left>mdi-plus</v-icon>
            Add Channel
          </v-btn>
        </div>
        <v-list-item v-for="channelItem in channels" :key="channelItem.id" :to="`/chat/${channelItem.id}`" exact>
          <v-list-item-content>
            <v-list-item-title># {{ channelItem.id }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2 text-center">
          <v-btn small href="https://firelayer.io/docs" target="_blank" text>Docs</v-btn>
          <v-btn small href="https://board.firelayer.io" target="_blank" text>Feedback</v-btn>
          <v-btn small href="https://github.com/firelayer/chat-template" target="_blank" text>Support</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-content>
      <v-container fill-height fluid class="pa-2">
        <v-layout>
          <slot v-if="user && !settings.maintenance"></slot>
          <div v-if="settings.maintenance" class="my-5 text-center d-flex flex-column flex-grow-1">
            <v-img
              class="mb-5"
              height="200px"
              contain
              src="/images/maintenance.svg"
            ></v-img>

            <h1>In Maintenance</h1>
            <p>We promise to be quick. Please come back later.</p>
          </div>
        </v-layout>
      </v-container>
    </v-content>

    <v-dialog v-model="createDialog" max-width="600">
      <v-card>
        <v-card-title class="title">Create Channel</v-card-title>
        <div class="pa-3">
          <v-text-field
            ref="channel"
            v-model="newChannel"
            label="Channel"
            maxlength="20"
            counter="20"
            autofocus
            @keyup.enter="createChannel()"
          ></v-text-field>
        </div>
        <v-card-actions class="pa-2">
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false">Cancel</v-btn>
          <v-btn :loading="isLoadingCreate" color="success" @click="createChannel()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { realtime } from '../firebase'
import UserMenu from '../components/common/UserMenu'
import UserAvatar from '../components/common/UserAvatar'

const settingsRef = realtime().ref('_settings/')
const channelsRef = realtime().ref('channels/')
const usersRef = realtime().ref('users/')

export default {
  components: {
    UserMenu,
    UserAvatar
  },
  data() {
    return {
      drawer: null,
      drawerRight: null,

      users: [],
      isLoadingUsers: true,
      channels: [],
      isLoadingChannels: true,

      // create channel
      createDialog: false,
      isLoadingCreate: false,
      newChannel: ''
    }
  },
  computed: {
    ...mapState('app', ['user', 'settings']),
    ...mapState('channel', ['channel'])
  },
  mounted() {
    settingsRef.on('value', (snapshot) => {
      this.setSettings(snapshot.val() || this.settings)
    })
    this.getUsers()
    this.getChannels()
  },
  beforeDestroy() {
    settingsRef.off()
    channelsRef.off()
    usersRef.orderByChild('state').equalTo('online').off()
  },
  methods: {
    ...mapActions('app', ['showError', 'showToast', 'showSuccess']),
    ...mapMutations('app', {
      setSettings: 'SET_SETTINGS'
    }),
    async getUsers() {
      usersRef.orderByChild('state').equalTo('online').on('value', (snapshot) => {
        const users = []

        this.isLoadingUsers

        snapshot.forEach((childSnapshot) => {
          const doc = childSnapshot.val()

          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })

        this.users = users.filter((u) => u.state === 'online')
      })
    },
    async getChannels() {
      channelsRef.on('value', (snapshot) => {
        const channels = []

        snapshot.forEach((childSnapshot) => {
          const doc = childSnapshot.val()

          channels.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })

        this.channels = channels
      })
    },
    async createChannel() {
      if (!this.newChannel) {
        this.$refs.channel.focus()

        return
      }

      this.isLoadingCreate = true

      try {
        const name = this.newChannel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '')

        await channelsRef.child(name).set({
          owner: this.user.uid
        })

        this.$router.push({ name: 'channel', params: { id: name } })

        this.showSuccess('Channel created!')
      } catch (error) {
        this.showError({ error })
      }

      this.isLoadingCreate = false
      this.createDialog = false
      this.newChannel = ''
    }
  }
}
</script>

<style lang="scss">
.v-list-item--active {
  .v-list-item__title {
    font-weight: bold !important;
  }
}
</style>
