<template>
  <md-toolbar class="md-primary">
    <div style="flex: 1"><md-button :md-ripple="false" @click="clickIcone"><h3 class="md-title">DANFY <span id="label">ALPHA</span></h3></md-button></div>
    <md-button @click="click">{{texto}}</md-button>
  </md-toolbar>
</template>

<script>
import { deslogar, usuarioAtivo } from './services'

export default {
  name: 'navbar',
  data () {
    return {
      texto: 'ENTRAR',
      tipoUsuario: ''
    }
  },
  created () {
    usuarioAtivo((ativo, usuario, tipo) => {
      if (ativo) {
        this.$data.tipoUsuario = tipo
        this.$data.texto = 'SAIR'
      } else {
        this.$data.texto = 'ENTRAR'
      }
    })
  },
  methods: {
    clickIcone () {
      if (this.$data.texto === 'ENTRAR') {
        this.$router.push('/')
      } else if (this.$data.tipoUsuario === 'mult') {
        this.$router.push('/menu')
      } else {
        this.$router.push('/mostrarMovimentos')
      }
    },
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
