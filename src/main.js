import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuex from 'vuex'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vuetify/dist/vuetify.min.css'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css'
import './assets/theme.scss'

import router from './router'
import { modules } from './store'

Vue.use(Vuex)
Vue.use(VueMaterial)
Vue.use(Vuetify)

export const storeVuex = new Vuex.Store({
  modules: modules
})

new Vue({
  el: '#app',
  router,
  store: storeVuex,
  render: h => h(App)
})
