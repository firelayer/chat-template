import Vue from 'vue'
import Vuex from 'vuex'
import AppModule from './app'
import ChannelModule from './channel'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app: AppModule,
    channel: ChannelModule
  }
})

export default store
