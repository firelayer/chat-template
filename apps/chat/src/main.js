import Vue from 'vue'
import { get } from 'lodash'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import '../public/style/critical.css'
import './firebase'
import './middlewares'

Vue.prototype.$get = get

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
