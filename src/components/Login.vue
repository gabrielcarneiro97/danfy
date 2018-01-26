<template>
  <div class="md-layout md-alignment-top-right" id="main">
    <div class="md-layout-item md-size-75 md-layout  md-alignment-center-center" style="min-height: 90vh;">
      <h1 style="font-size: 380%">DANFY <span id="label">ALPHA</span></h1>
      <font-awesome-icon style="margin-left:1.5vw" color="black" :icon="faFileAlt" size="7x" />
    </div>
    <div class="md-layout-item md-size-25">
      <md-card style="min-height: 90vh;">
        <md-card-content style="margin-top: 25vh">
          <md-field>
            <label>E-MAIL</label>
            <md-input v-model="login"></md-input>
          </md-field>
          <md-field>
            <label>SENHA</label>
            <md-input v-model="senha" type="password"></md-input>
          </md-field>
        </md-card-content>

        <md-card-actions class="md-layout md-alignment-center-center">
          <md-button class="md-layout-item md-raised md-primary" @click="registrar">REGISTRAR</md-button>
          <md-button class="md-layout-item md-raised md-primary" @click="entrar">LOGIN</md-button>
        </md-card-actions>
      </md-card>
    </div>

    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />

  </div>
</template>
<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faFileAlt } from '@fortawesome/fontawesome-free-regular'
import { entrar, usuarioAtivo } from './services'

export default {
  components: {
    FontAwesomeIcon
  },
  computed: {
    faFileAlt: _ => faFileAlt
  },
  name: 'login',
  created () {
    usuarioAtivo((ativo, usuario, tipoDominio) => {
      if (ativo) {
        if (tipoDominio === 'unico') {
          this.$router.push('/mostrarMovimentos')
        } else if (tipoDominio === 'mult') {
          this.$router.push('/menu')
        }
      }
    })
  },
  data () {
    return {
      erro: {
        mostra: false,
        mensagem: ''
      },
      login: '',
      senha: ''
    }
  },
  methods: {
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    },
    entrar () {
      let login = this.$data.login
      let senha = this.$data.senha

      entrar(login, senha, (err, usuario) => {
        if (err) {
          switch (err.code) {
            case 'auth/invalid-email':
              this.chamarMensagem(new Error('E-mail invalido!'))
              break
            case 'auth/user-disabled':
              this.chamarMensagem(new Error('Usuário desabilitado!'))
              break
            case 'auth/user-not-found':
              this.chamarMensagem(new Error('Usuário não encontrado!'))
              break
            case 'auth/wrong-password':
              this.chamarMensagem(new Error('Senha incorreta!'))
              break
            case 'dominio/null':
              this.chamarMensagem(err)
              break
            default:
              break
          }
        } else {
          usuarioAtivo((ativo, usuario, tipoDominio) => {
            if (ativo) {
              if (tipoDominio === 'unico') {
                this.$router.push('/mostrarMovimentos')
              } else {
                this.$router.push('/menu')
              }
            }
          })
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
  #label {
    font-size: 8.5px;
    vertical-align: text-top;
  }
</style>
