<template>
  <v-layout row wrap fill-height>
    <v-flex xs9 text-xs-center style="padding-top: 35vh">
      <h1 style="font-size: 380%">DANFY <span id="label">ALPHA</span>
        <font-awesome-icon color="black" :icon="faFileAlt" size="2x" />      
      </h1>
    </v-flex>
    <v-flex accent style="padding-top: 21vh">
      <v-container>
        <v-text-field
          name="login"
          label="E-MAIL"
          id="login"
          v-model="login"
          dark
        ></v-text-field>
        <v-text-field
          name="password"
          label="SENHA"
          id="password"
          v-model="senha"
          type="password"
          dark
        ></v-text-field>
      </v-container>
      <v-container row wrap text-xs-center style="margin-top:-8%">
        <v-flex xs12>
          <v-btn block @click="entrar">LOGIN</v-btn>
        </v-flex>
        <v-flex xs12>
          <v-btn block @click="registrar">REGISTRAR</v-btn>
        </v-flex>
      </v-container>
    </v-flex>
    <erro :mensagem="erro.mensagem" :sync="erro.mostra" @fechar-erro="erro.mostra = false" />
  </v-layout>
</template>
<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faFileAlt } from '@fortawesome/fontawesome-free-regular'
import { entrar, usuarioAtivo } from './services'
import Erro from './Erro'

export default {
  components: {
    FontAwesomeIcon,
    Erro
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
