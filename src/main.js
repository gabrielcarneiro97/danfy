import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css'
import './assets/theme.scss'
import router from './router'

Vue.use(Vuex)
Vue.use(VueMaterial)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
