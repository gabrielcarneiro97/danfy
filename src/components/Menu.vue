<template>

  <div class="md-layout md-alignment-top-right" id="main">
    <div class="md-layout-item md-size-25">
      <md-card style="min-height: 90vh;">
        <md-card-content style="margin-top: 1vh">
          <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
            <md-button disabled class="md-layout-item md-size-100 md-primary"><h1 class="md-title" style="color: black">MENU</h1><span id="label" style="color: black">{{version}}</span></md-button>
          </div>
          <md-divider style="margin-bottom: 1vh; margin-top: 1vh"></md-divider>          
          <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
            <md-button class="md-layout-item md-size-100 md-primary" to="/importar">IMPORTAR</md-button>
          </div>
          <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
            <md-button class="md-layout-item md-size-100 md-primary" to="/mostrarMovimentos">VISUALIZAR MOVIMENTOS</md-button>
          </div>
          <div v-if="perm > 1" class="md-layout md-layout-item md-size-100 md-alignment-top-right">
            <md-button class="md-layout-item md-size-100 md-primary" to="/admin">PAINEL DO ADMINISTRADOR</md-button>
          </div>
        </md-card-content>
      </md-card>
    </div>
    <div class="md-layout-item md-size-75 md-layout  md-alignment-center-center" style="min-height: 90vh;">
      <h1 style="font-size: 380%">DANFY <span id="label">ALPHA</span></h1>
      <font-awesome-icon style="margin-left:1.5vw" color="black" :icon="faFileAlt" size="7x" />
    </div>
  </div>

</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faFileAlt } from '@fortawesome/fontawesome-free-regular'
import { version, usuarioAtivo } from './services'

export default {
  created () {
    usuarioAtivo((u, usuario, tipoDominio) => {
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
