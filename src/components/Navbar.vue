<template>
  <md-toolbar class="md-primary">
    <h3 class="md-title" style="flex: 1">DANFY</h3>
    <md-button @click="click">{{texto}}</md-button>    
  </md-toolbar>
</template>

<script>
import * as firebase from 'firebase'
import store from '../store'
import { sair } from '../store/actions'

var config = {
  apiKey: 'AIzaSyDj9qOI4GtZwLhX7T9Cm0GZgYp_8E7Qsps',
  authDomain: 'danfy-4d504.firebaseapp.com',
  databaseURL: 'https://danfy-4d504.firebaseio.com',
  projectId: 'danfy-4d504',
  storageBucket: 'danfy-4d504.appspot.com',
  messagingSenderId: '979812955533'
}
firebase.initializeApp(config)

var auth = firebase.auth()

export default {
  name: "navbar",
  data () {
    return {
      texto: 'ENTRAR'
    }
  },
  created () {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.$data.texto = 'SAIR'
      } else {
        this.$data.texto = 'ENTRAR'
      }
    });
  },
  methods: {
    click () {
      if(this.$data.texto === 'SAIR'){
        auth.signOut().then(value => {
          this.$router.push('/login')
          store.dispatch(sair())
        })
      }
      else {
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="sass" scoped>

</style>
