<template>
  <v-layout row wrap fill-height>
    <v-flex accent>
      <v-container row wrap text-xs-center>
        <v-flex xs12>
          <v-btn block  @click="goTo('/importar')">IMPORTAR</v-btn>
        </v-flex>
        <v-flex xs12>
          <v-btn block @click="goTo('/mostrarMovimentos')">VISUALIZAR MOVIMENTOS</v-btn>
        </v-flex>
        <v-flex xs12>
          <v-btn block @click="goTo('/perfil')">GERENCIAR CONTA</v-btn>
        </v-flex>
        <v-flex xs12 v-if="perm > 1">
          <v-btn block @click="goTo('/admin')">PAINEL DO ADMINISTRADOR</v-btn>
        </v-flex>
      </v-container>
    </v-flex>
    <v-flex xs9 text-xs-center style="padding-top: 35vh">
      <h1 style="font-size: 380%">DANFY <span id="label">ALPHA ({{version}})</span>
        <font-awesome-icon color="black" :icon="faFileAlt" size="2x" />      
      </h1>
    </v-flex>
  </v-layout>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faFileAlt } from '@fortawesome/fontawesome-free-regular'
import { version, usuarioAtivo, cursorNormal, limparStore } from './services'

export default {
  created () {
    usuarioAtivo((u, usuario, tipoDominio) => {
      limparStore()
      cursorNormal()
      if (u) {
        if (tipoDominio !== 'mult') {
          this.$router.push('/login')
        } else {
          this.$data.perm = usuario.nivel
        }
      } else {
        this.$router.push('/')
      }
    })
  },
  data () {
    return {
      perm: 0
    }
  },
  methods: {
    goTo (route) {
      this.$router.push(route)
    }
  },
  components: {
    FontAwesomeIcon
  },
  computed: {
    faFileAlt: _ => faFileAlt,
    version: _ => version
  }

}
</script>

<style lang="scss" scoped>
#form {
  margin-top: 5%;
  margin-bottom: 2%;
}
#inner {
  padding: 1%;
  background-color: rgb(255, 255, 255)
}
#label {
  font-size: 8.5px;
  vertical-align: text-top;
  width: 100%;
}
</style>
