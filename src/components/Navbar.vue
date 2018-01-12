<template>
  <md-toolbar class="md-primary">
    <h3 class="md-title" style="flex: 1">DANFY</h3>
    <md-button @click="click">{{texto}}</md-button>    
  </md-toolbar>
</template>

<script>
import store from '../store'
import { deslogar, usuarioAtivo } from './services/firebase.service'

export default {
  name: "navbar",
  data () {
    return {
      texto: 'ENTRAR'
    }
  },
  created () {
    usuarioAtivo(ativo => {
      if (ativo) {
        this.$data.texto = 'SAIR'
      } else {
        this.$data.texto = 'ENTRAR'
      }
    })
  },
  methods: {
    click () {
      if(this.$data.texto === 'SAIR') {
        deslogar (() => {
          this.$router.push('/login')
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
