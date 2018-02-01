<template>
  <div class="md-layout md-alignment-top-center" id="main">  
    <md-card class="md-layout-item md-size-90">
      <md-card-header class="md-layout">
        <p class="titulo" style="font-size:190%">Gerenciar Conta</p>
      </md-card-header>
      <md-card-content>
        <md-divider></md-divider>        
        <div class="md-layout md-alignment-right-top">
          <div class="md-layout-item titulo">Geral</div>
        </div>
        <div class="md-layout md-alignment-center-left">
          
          <md-field class="md-layout-item md-size-78">
            <label>Nome</label>
            <md-input v-model="usuario.nome"></md-input>
          </md-field>
          <md-button class="md-primary md-layout-item md-size-20" :disabled="desligarNome" @click="alterarCampo(usuario.nome, 'nome')">
            ALTERAR
          </md-button>

          <md-field class="md-layout-item md-size-78">
            <label>dominio</label>
            <md-input v-model="usuario.dominio"></md-input>
          </md-field>
          <md-button class="md-primary md-layout-item md-size-20" :disabled="desligarDominio" @click="alterarCampo(usuario.nome, 'dominio')">
            ALTERAR
          </md-button>

        </div>
        <div class="md-layout md-alignment-center-left">
          
          <md-field class="md-layout-item md-size-100">
            <label>E-mail</label>
            <md-input v-model="usuario.email" disabled></md-input>
          </md-field>

        </div>

        <md-divider></md-divider>        
        <div class="md-layout md-alignment-right-top">
          <div class="md-layout-item titulo">Alterar Senha</div>
        </div>
        <div class="md-layout md-alignment-center-left">
          
          <md-field class="md-layout-item md-size-78">
            <label>Senha antiga</label>
            <md-input v-model="senha.antiga" type="password"></md-input>
          </md-field>
          <md-field class="md-layout-item md-size-78">
            <label>Nova</label>
            <md-input v-model="senha.nova" type="password"></md-input>
          </md-field>
          <md-field class="md-layout-item md-size-78">
            <label>Confirmar Nova</label>
            <md-input v-model="senha.confirmacao" type="password"></md-input>
          </md-field>
          <md-button class="md-primary md-layout-item md-size-20" @click="trocarSenha">
            ALTERAR
          </md-button>

        </div>
      </md-card-content>

    </md-card>

    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />

  </div>
</template>

<script>
import { usuarioAtivo, trocarSenha, alterarDadoUsuario } from './services'

export default {
  data () {
    return {
      usuario: {
        nome: '',
        dominio: '',
        email: ''
      },
      senha: {
        nova: '',
        antiga: '',
        confirmacao: ''
      },
      erro: {
        mostra: false,
        mensagem: ''
      }
    }
  },
  created () {
    usuarioAtivo((ativo, usuario) => {
      if (!ativo) {
        this.$router.push('/login')
      } else {
        this.$data.usuario = {
          ...usuario,
          email: ativo.email,
          id: ativo.uid
        }
      }
    })
  },
  methods: {
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    },
    trocarSenha () {
      if (this.$data.senha.nova !== this.$data.senha.confirmacao) {
        this.chamarMensagem(new Error('A nova senha e a confirmação não batem!'))
      } else {
        trocarSenha(this.$data.senha.nova, this.$data.senha.antiga, this.$data.usuario.email, (err) => {
          if (!err.code) {
            this.chamarMensagem(err)
          } else {
            if (err.code === 'auth/wrong-password') {
              this.chamarMensagem(new Error('A senha antiga está errada!'))
            } else if (err.code === 'auth/weak-password') {
              this.chamarMensagem(new Error('A nova senha é muito fraca!'))
            }
          }
        })
      }
    },
    alterarCampo (dado, campo) {
      alterarDadoUsuario(dado, campo, this.$data.usuario.id, (err) => {
        if (err) {
          this.chamarMensagem(err)
        } else {
          this.chamarMensagem(new Error('Campo alterado com sucesso!'))
          this.$data.campoAlterado = true
        }
      })
    }
  },
  computed: {
    desligarNome () {
      return this.$data.usuario.nome === this.$store.state.usuario.nome
    },
    desligarDominio () {
      return this.$data.usuario.dominio === this.$store.state.usuario.dominio
    }
  }

}
</script>

<style lang="scss" scoped>

  #main {
    margin-top: 3%;
  }

  .titulo {
    font-size: 160%;
    margin-bottom: 1%;
    margin-top: 2%;    
    font-weight: 300;
    color: Black;
  }

</style>
