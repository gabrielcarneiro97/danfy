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
        <div class="md-layout md-alignment-top-right">
          <md-button class="md-layout-item md-size-45 trocar">ATUALIZAR</md-button>
        </div>
      </md-content>
    </div>
  </div>
</template>

<script>
import store from '../store'
import { usuarioAtivo } from './services'

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
    usuarioAtivo((ativo, usuario) => {
      if (!ativo) {
        this.$router.push('/login')
      } else {
        this.$data.nome = usuario.nome
        this.$data.dominio = usuario.dominio
        this.$data.email = usuario.email
        this.$data.id = usuario.id
      }
    })
  },
  methods: {
    change () {
      let usuario = store.getState().usuario

      if (this.$data.nome !== usuario.nome ||
      this.$data.email !== usuario.email ||
      this.$data.dominio !== usuario.dominio) {
      }
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
