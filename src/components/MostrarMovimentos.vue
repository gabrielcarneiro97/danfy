<template>
<div>
  <div class="md-layout md-alignment-top-center" id="form">
    <div class="md-layout md-layout-item md-size-85" id="inner">
        <md-field class="md-layout-item md-size-20">
          <label>Número</label>
          <md-input v-model="empresaSelecionada.numero" @input="selecionaPorNumero"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-40">
          <label>CNPJ</label>
          <md-input v-model="empresaSelecionada.pessoa.cnpj" disabled></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-40">
          <label>NOME</label>
          <md-input v-model="empresaSelecionada.pessoa.nome" disabled></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-40">
          <label>MÊS</label>
          <md-input v-model="competenciaSelecionada.mes"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-40">
          <label>ANO</label>
          <md-input v-model="competenciaSelecionada.ano"></md-input>
        </md-field>
        <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
          <md-button class="md-layout-item md-size-25 md-primary" @click="selecionarMovimento">SELECIONAR</md-button>
        </div>
    </div>
  </div>

  <div class="md-layout md-alignment-top-center">
    <md-table v-if="!semMovimentos" class="md-layout-item md-size-90">
      <md-table-row>
        <md-table-head md-numeric>Número</md-table-head>
        <md-table-head>Emitente</md-table-head>
        <md-table-head>Destinatário</md-table-head>
        <md-table-head>Natureza Operação</md-table-head>
        <md-table-head>Valor</md-table-head>
        <md-table-head>Status</md-table-head>
      </md-table-row>

      <md-table-row v-for="movimento in movimentos" v-bind:key="movimento.notaFinal">

        <md-table-cell md-numeric>{{nota.geral.numero}}</md-table-cell>

        <md-table-cell>{{pessoas[nota.emitente].nome}}</md-table-cell>
        <md-table-cell>{{pessoas[nota.destinatario].nome}}</md-table-cell>

        <md-table-cell>{{nota.geral.naturezaOperacao}}</md-table-cell>
        <md-table-cell>{{nota.valor.total}}</md-table-cell>
        <md-table-cell>{{nota.geral.status}}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</div>
</template>
<script>
import { pegarDominio, usuarioAtivo, pegarPessoaId, pegarMovimentosMes } from './services/firebase.service'
import store from '../store'

export default {
  data () {
    return {
      dominio: null,
      empresaSelecionada: {
        numero: null,
        pessoa: {}
      },
      competenciaSelecionada: {
        mes: null,
        ano: null
      },
      semMovimentos: true
    }
  },
  created () {
    usuarioAtivo(ativo => {
      if (!ativo) this.$router.push('/login')

      pegarDominio((err, dominio) => {
        if (err) console.error(err)
        this.$data.dominio = dominio
      })
    })
  },
  methods: {
    selecionaPorNumero (numero) {
      if (this.$data.dominio.empresas[numero]) {
        let cnpj = this.$data.dominio.empresas[numero]
        pegarPessoaId(cnpj, (err, pessoa) => {
          if (err) {
            console.error(err)
          } else {
            pessoa.cnpj = cnpj
            this.$data.empresaSelecionada.pessoa = pessoa
          }
        })
      } else {
        this.$data.empresaSelecionada = {
          numero: null,
          pessoa: {}
        }
      }
    },
    selecionarMovimento () {
      pegarMovimentosMes(this.$data.empresaSelecionada.pessoa.cnpj, this.$data.competenciaSelecionada, (err, movimentos) => {
        if (err) console.error(err)

        console.log(movimentos)
      })
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
