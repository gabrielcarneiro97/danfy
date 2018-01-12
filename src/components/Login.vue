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
          <md-button @click="registrar">REGISTRAR</md-button>
          <md-button @click="entrar">LOGIN</md-button>          
        </md-card-actions>
      </md-card>
    </div>
    
  </div>
</template>
<script>
import store from '../store'
import { sair, autenticar } from '../store/actions'
import { entrar, usuarioAtivo } from './services/firebase.service'

export default {
  name: 'login',
  created () {
    usuarioAtivo((ativo, usuario) => {
      if (ativo) {
        this.$router.push('/perfil')
      }
    })
  },
  data () {
    return {
      login: 'gabriel@andreacontabilidade.com',
      senha: '123456'
    }
  },
  methods: {
    entrar () {
      let login = this.$data.login
      let senha = this.$data.senha
      
      entrar(login, senha, (err, usuario) => {
        if(err) console.error(err)
        else {
          this.$router.push('/perfil')
        }
      })

    },
    registrar () {
      this.$router.push('/registrar')
    }
  }
}
</script>
<style lang="scss" scoped>
  #main {
    margin-top: 12%;
  }
</style>
