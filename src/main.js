import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/black-green-light.css'
import router from './router'

Vue.use(VueMaterial)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
