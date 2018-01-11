<template>
  <div id="app">
    <navbar></navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/Navbar'
import * as firebase from 'firebase'

var config = {
  apiKey: "AIzaSyDj9qOI4GtZwLhX7T9Cm0GZgYp_8E7Qsps",
  authDomain: "danfy-4d504.firebaseapp.com",
  databaseURL: "https://danfy-4d504.firebaseio.com",
  projectId: "danfy-4d504",
  storageBucket: "danfy-4d504.appspot.com",
  messagingSenderId: "979812955533"
}
firebase.initializeApp(config)
export default {
  name: 'app',
  components: {
    'navbar': Navbar
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style lang="scss">

</style>
