<template>
<div>
  <div class="md-layout md-alignment-top-center" id="form">
    <div class="md-layout-item md-size-85" id="inner">
        <md-field class="md-layout-item md-size-100">
          <label>Notas</label>
          <md-file multiple @change="ler" accept=".xml" />
        </md-field>
        <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
          <md-button class="md-layout-item md-size-25 md-primary" @click="enviar" :disabled="!clicaEnviar">ENVIAR</md-button>
        </div>

    </div>
  </div>

  <div class="md-layout md-alignment-top-center">
    <md-table class="md-layout-item md-size-90">
      <md-table-row v-if="!semNotas">
        <md-table-head md-numeric>Número</md-table-head>
        <md-table-head>Emitente</md-table-head>
        <md-table-head>Destinatário</md-table-head>
        <md-table-head>Natureza Operação</md-table-head>
        <md-table-head>Valor</md-table-head>
        <md-table-head>Status</md-table-head>
      </md-table-row>

      <md-table-row v-for="nota in ordenarNotas" v-bind:key="nota.emitente + nota.geral.numero">

        <md-table-cell md-numeric>{{nota.geral.numero}}</md-table-cell>

        <md-table-cell>{{pessoas[nota.emitente].nome}}</md-table-cell>
        <md-table-cell>{{pessoas[nota.destinatario].nome}}</md-table-cell>

        <md-table-cell>{{nota.geral.naturezaOperacao}}</md-table-cell>
        <md-table-cell>{{nota.valor.total}}</md-table-cell>
        <md-table-cell>{{nota.geral.status}}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>

  <md-dialog :md-active.sync="mostra">
    <md-dialog-content>

      <md-table v-model="foraDominio" md-card @md-selected="selecaoTabela">
        <md-table-toolbar>
          <h1 class="md-title">Selecione as empresas que você deseja adicionar ao domínio e informe um número</h1>
        </md-table-toolbar>

        <md-table-toolbar slot="md-table-alternate-header" slot-scope="{ count }">
          <div class="md-toolbar-section-start">{{ mensagemTabela(count) }}</div>
        </md-table-toolbar>

        <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple" md-auto-select>
          <md-table-cell md-label="CNPJ" md-sort-by="nome">{{ item.cnpj }}</md-table-cell>
          <md-table-cell md-label="Nome" md-sort-by="cnpj">{{ pessoas[item.cnpj].nome }}</md-table-cell>
          <md-table-cell md-label="Número" md-sort-by="numero">
            <md-field>
              <md-input v-model="item.num"></md-input>
            </md-field>
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="proximo">PRÓXIMO</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import _ from 'lodash'
import store from '../store'
import { usuarioAtivo, lerNotasInput, adicionarEmpresaDominio, gravarPessoas, gravarNotas } from './services/firebase.service'

export default {
  data () {
    return {
      notas: {},
      pessoas: {},
      foraDominio: [],
      adicionarDominio: [],
      mostra: false,
      clicaEnviar: false
    }
  },
  created () {
    usuarioAtivo(ativo => {
      if (!ativo) this.$router.push('/login')
    })
  },
  updated () {

  },
  methods: {
    ler (e) {
      if (e.target.files) {
        lerNotasInput(e.target.files, (notas, pessoas) => {
          this.$data.notas = notas
          this.$data.pessoas = pessoas
          this.$data.clicaEnviar = true
          this.$data.foraDominio = []
          this.$data.adicionarDominio = []

          let dominio = store.getState().dominio

          Object.keys(pessoas).forEach(keyPessoa => {
            if (keyPessoa.length === 11) return 0

            let empresas = dominio.empresas

            let jaNoDominio = Object.keys(empresas).some((keyEmpresa, index) => {
              return empresas[keyEmpresa] === keyPessoa
            })

            if (!jaNoDominio) {
              this.$data.foraDominio.push({cnpj: keyPessoa, num: 0})
            }
          })
        })
      }
    },
    enviar () {
      if (this.$data.foraDominio.length === 0) {
        gravarPessoas(err => {
          if (err) console.error(err)
          else {
            gravarNotas(err => {
              if (err) console.error(err)
              else this.$router.push('/conciliarNotas')
            })
          }
        })
      } else {
        this.$data.mostra = true
      }
    },
    mensagemTabela (count) {
      let plural = ''

      if (count > 1) {
        plural = 's'
      }

      return `${count} empresa${plural} selecionada${plural}`
    },
    selecaoTabela (items) {
      this.$data.adicionarDominio = items
    },
    proximo () {
      let adicionar = this.$data.adicionarDominio
      if (adicionar.length > 0) {
        adicionar.forEach((empresa, index) => {
          if (empresa.num !== 0) {
            adicionarEmpresaDominio(empresa, (err, dominio) => {
              if (err) console.error(err)

              if (index === adicionar.length - 1) {
                gravarPessoas(err => {
                  if (err) console.error(err)
                  else {
                    gravarNotas(err => {
                      if (err) console.error(err)
                      else this.$router.push('/conciliarNotas')
                    })
                  }
                })
              }
            })
          }
        })
      } else {
        this.$router.push('/conciliarNotas')
      }
    }
  },
  computed: {
    ordenarNotas () {
      return _.orderBy(this.$data.notas, 'geral.numero')
    },
    semNotas () {
      return _.isEmpty(this.$data.notas)
    }
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
</style>
