<template>
  <div class="md-layout md-alignment-bottom-center" id="main">
    <div class="md-layout-item md-size-60">
      <md-card>
        <md-card-content id="content">
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-size-100">
              <md-field>
                <label>NOME *</label>
                <md-input v-model="form.nome"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50">
              <md-field>
                <label>E-MAIL *</label>
                <md-input v-model="form.login"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50">
              <md-field>
                <label>CONFIRMAR E-MAIL *</label>
                <md-input v-model="form.confirmaLogin"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50">
                <md-field>
                  <label>SENHA *</label>
                  <md-input v-model="form.senha" type="password"></md-input>
                </md-field>
            </div>
            <div class="md-layout-item md-size-50">
                <md-field>
                  <label>CONFIRMAR SENHA *</label>
                  <md-input v-model="form.confirmaSenha" type="password"></md-input>
                </md-field>
            </div>
            <div class="md-layout-item md-size-100">
              <md-field>
                <label>DOMÍNIO *</label>
                <md-input v-model="form.dominio"></md-input>
              </md-field>
            </div>
          </div>
        </md-card-content>

        <md-card-actions>
          <md-button @click="registrar">REGISTRAR</md-button>
        </md-card-actions>
      </md-card>
    </div>
    <md-snackbar md-position="left" :md-duration="duration" :md-active.sync="showSnackbar">
        <span>{{erro}}</span>
        <md-button class="md-primary" @click="showSnackbar = false">FECHAR</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import { criarUsuario, usuarioAtivo } from './services'

export default {
  created () {
    usuarioAtivo((ativo, usuario) => {
      if (ativo) {
        this.$router.push('/perfil')
      }
    })
  },
  data () {
    return {
      form: {
        nome: '',
        login: '',
        confirmaLogin: '',
        senha: '',
        confirmaSenha: '',
        dominio: ''
      },
      showSnackbar: false,
      duration: 3000,
      erro: ''
    }
  },
  methods: {
    registrar () {
      let form = this.$data.form
      let campoVazio

      Object.keys(form).forEach(campoKey => {
        let campo = form[campoKey]

        let nomeBonito = ''

        switch (campoKey) {
          case 'nome':
            nomeBonito = 'Nome'
            break
          case 'login':
            nomeBonito = 'E-mail'
            break
          case 'confirmaLogin':
            nomeBonito = 'Confirmar E-mail'
            break
          case 'senha':
            nomeBonito = 'Senha'
            break
          case 'confirmaSenha':
            nomeBonito = 'Confirmar Senha'
            break
          case 'dominio':
            nomeBonito = 'Domínio'
            break
          default:
            break
        }

        if (campoKey === 'dominio' && campo === '' && !campoVazio) {
          this.$data.erro = 'Domínio é um campo obrigatório, para consultar seu domínio favor entre em contato com o suporte!'
          this.$data.showSnackbar = true
          campoVazio = true
        } else if (campo === '' && !campoVazio) {
          this.$data.erro = `Campo ${nomeBonito} é obrigatório!`
          this.$data.showSnackbar = true
          campoVazio = true
        }
      })

      if (!campoVazio) {
        if (form.login !== form.confirmaLogin) {
          this.$data.erro = 'E-mail e confirmação estão diferentes!'
          this.$data.showSnackbar = true
        } else if (form.senha !== form.confirmaSenha) {
          this.$data.erro = 'Senha e confirmação estão diferentes!'
          this.$data.showSnackbar = true
        } else {
          criarUsuario({nome: form.nome, dominio: form.dominio, login: form.login, senha: form.senha}, (err, usuario) => {
            if (err) {
              switch (err.code) {
                case 'auth/email-already-in-use':
                  this.$data.erro = 'E-mail já está sendo usado por outro úsuario!'
                  this.$data.showSnackbar = true
                  break
                case 'auth/invalid-email':
                  this.$data.erro = 'E-mail informado não é valido!'
                  this.$data.showSnackbar = true
                  break
                case 'auth/operation-not-allowed':
                  this.$data.erro = 'Operação negada!'
                  this.$data.showSnackbar = true
                  break
                case 'auth/weak-password':
                  this.$data.erro = 'A senha deve ter pelo menos 6 caracteres!'
                  this.$data.showSnackbar = true
                  break
              }
            } else {
              this.$router.push('/login')
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  #main {
    margin-top: 6%;
  }
  #content {
    padding: 3%;
  }
</style>
