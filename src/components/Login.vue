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
import * as firebase from "firebase"

export default {
  name: 'login',
  data () {
    return {
      login: null,
      senha: null
    }
  },
  methods: {
    enter () {
      let login = this.$data.login
      let senha = this.$data.senha
      firebase.auth().signInWithEmailAndPassword(login, senha).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(error)
        // ...
      });

    }
  }
}
</script>
<style lang="scss" scoped>
  #main {
    margin-top: 12%;
  }
</style>
