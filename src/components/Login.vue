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
        } else {
          this.$router.push('/menu')
        }
      }
    })
  },
  data () {
    return {
      login: '',
      senha: ''
    }
  },
  methods: {
    entrar () {
      let login = this.$data.login
      let senha = this.$data.senha

      entrar(login, senha, (err, usuario) => {
        if (err) console.error(err)
        else {
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
