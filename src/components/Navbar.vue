<template>
  <md-toolbar class="md-primary">
    <div style="flex: 1"><md-button :md-ripple="false" to="/menu"><h3 class="md-title">DANFY <span id="label">ALPHA</span></h3></md-button></div>
    <md-button @click="click">{{texto}}</md-button>
  </md-toolbar>
</template>

<script>
import { deslogar, usuarioAtivo } from './services'

export default {
  name: 'navbar',
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
      if (this.$data.texto === 'SAIR') {
        deslogar(() => {
          this.$router.push('/login')
        })
      } else {
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#label {
  font-size: 8.5px;
  vertical-align: text-top;
}
</style>
