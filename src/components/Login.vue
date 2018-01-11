<template>
  <div class="md-layout md-alignment-bottom-center" id="main">
    <div class="md-layout-item md-size-25">
      <md-card>
        <md-card-content>
          <md-field>
            <label>E-MAIL</label>
            <md-input v-model="login"></md-input>
          </md-field>
          <md-field>
            <label>SENHA</label>
            <md-input v-model="senha" type="password"></md-input>
          </md-field>
        </md-card-content>

        <md-card-actions>
          <md-button @click="enter">LOGIN</md-button>
        </md-card-actions>
      </md-card>
    </div>
    
  </div>
</template>
<script>
import * as firebase from 'firebase'
import store from '../store'
import { sair, autenticar } from '../store/actions'

let db = firebase.database()

export default {
  name: 'login',
  data () {
    return {
      login: 'gabriel@andreacontabilidade.com',
      senha: 'ga102030'
    }
  },
  methods: {
    enter () {
      let login = this.$data.login
      let senha = this.$data.senha
      
      firebase.auth().signInWithEmailAndPassword(login, senha).then(user => {
        console.log(user)
        store.dispatch(autenticar({email: login, token: user.getIdToken(), id: user.uid}))
        console.log(store.getState())
        let empresa = db.ref('Empresas').once('value').then(value => {
          console.log(value.key)
          console.log(value.val())
        })
        // this.$router.push('/')        
      }, err => {
        console.error(err)
      })

    }
  }
}
</script>
<style lang="scss" scoped>
  #main {
    margin-top: 12%;
  }
</style>
