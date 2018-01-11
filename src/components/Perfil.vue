<template>
   <div class="md-layout md-alignment-top-center" id="main">
    <div class="md-layout-item md-size-30 md-elevation-2">
      <md-content id="menu" class="md-layout">
        <md-button class="menu-btn md-layout-item md-size-100">Teste</md-button>
        <md-button class="menu-btn md-layout-item md-size-100">Teste</md-button>
      </md-content>
    </div>
    <div class="md-layout-item md-size-60 md-elevation-2" id="infos">
      <md-content class="md-layout md-alignment-top-center">
        <md-field class="md-layout-item md-size-90 dados">
          <label>NOME</label>
          <md-input v-model="nome"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-90 dados">
          <label>E-MAIL</label>
          <md-input v-model="email"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-90 dados">
          <label>DOMÍNIO</label>
          <md-input v-model="dominio"></md-input>
        </md-field>
      </md-content>
    </div>
  </div>
</template>

<script>
import store from '../store'
import * as firebase from 'firebase'

var db = firebase.database()
var auth = firebase.auth()

console.log(store.getState())

export default {
  data () {
    return {
      nome: null,
      dominio: null,
      email: null,
      id: null
  
    }
  },
  created () {
    if(!auth.currentUser) {
      this.$router.push('/login')
    }
    else {
      let usuario = store.getState().usuario
      this.$data.nome = usuario.nome
      this.$data.dominio = usuario.dominio
      this.$data.email = usuario.email
      this.$data.id = usuario.id
    }
  }
  
}
</script>

<style lang="scss" scoped>
  
  #main {
    margin-top: 6%;
  }
  #infos {
    margin-left: .5%;
  }
  

</style>
