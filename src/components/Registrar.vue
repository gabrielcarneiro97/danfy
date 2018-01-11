<template>
  <div class="md-layout md-alignment-bottom-center" id="main">
    <div class="md-layout-item md-size-60">
      <md-card>
        <md-card-content id="content">
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-size-100">
              <md-field>
                <label>NOME *</label>
                <md-input v-model="nome"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50">
              <md-field>
                <label>E-MAIL *</label>
                <md-input v-model="login"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50">
              <md-field>
                <label>CONFIRMAR E-MAIL *</label>
                <md-input v-model="confirmaLogin"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50">
                <md-field>
                  <label>SENHA *</label>
                  <md-input v-model="senha" type="password"></md-input>
                </md-field>
            </div>
            <div class="md-layout-item md-size-50">
                <md-field>
                  <label>CONFIRMAR SENHA *</label>
                  <md-input v-model="confirmaSenha" type="password"></md-input>
                </md-field>
            </div>
            <div class="md-layout-item md-size-100">
              <md-field>
                <label>DOMÍNIO *</label>
                <md-input v-model="dominio"></md-input>
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
import * as firebase from 'firebase'
import store from '../store'
import { autenticar } from '../store/actions'

var db = firebase.database()

export default {
  data () {
    return {
      nome: 'Gabriel Carneiro',
      login: 'gabriel@andreacontabilidade.com',
      confirmaLogin: 'gabriel@andreacontabilidade.com',
      senha: '123456',
      confirmaSenha: '123456',
      dominio: 'andreacont',
      showSnackbar: false,
      duration: 3000,
      erro: "null"
    }
  },
  methods: {
    registrar () {

      let login = this.$data.login
      let confirmaLogin = this.$data.confirmaLogin
      let senha = this.$data.senha
      let confirmaSenha = this.$data.confirmaSenha
      let nome = this.$data.nome
      let dominio = this.$data.dominio

      if (nome === null || login === null || senha === null) {
        this.$data.erro = 'Campo obrigatório não preenchido!'
        this.$data.showSnackbar = true
        return 0
      }
      if (login !== confirmaLogin) {
        this.$data.erro = 'E-mail e confirmação estão diferentes!'
        this.$data.showSnackbar = true
        return 0
      }
      if (senha !== confirmaSenha) {
        this.$data.erro = 'Senha e confirmação estão diferentes!'
        this.$data.showSnackbar = true
        return 0
      }
      if (dominio === null) {
        this.$data.erro = 'Domínio é um campo obrigatório, para consultar seu domínio favor entre em contato com o suporte!'
        this.$data.showSnackbar = true
        return 0
      }

      firebase.auth().createUserWithEmailAndPassword(login, senha).then(user => { 

        store.dispatch(autenticar({nome: nome, dominio: dominio, email: login, token: user.getIdToken(), id: user.uid}))

        let usuario = store.getState().usuario

        db.ref('Usuarios/' + usuario.id).set({
          nome: nome,
          dominio: dominio
        })


        this.$router.push('/')

      })

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
