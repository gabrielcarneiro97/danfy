<template>
<div>
  <md-field>
    <label>Notas</label>
    <md-file multiple @change="ler" accept=".xml" />
  </md-field>

  <md-table>
      <md-table-row v-if="!semNotas">
        <md-table-head md-numeric>Número</md-table-head>
        <md-table-head>Emitente</md-table-head>
        <md-table-head>Destinatário</md-table-head>
        <md-table-head>Natureza Operação</md-table-head>
        <md-table-head>Valor</md-table-head>
      </md-table-row>

      <md-table-row v-for="nota in ordenarNotas" v-bind:key="nota.emitente + nota.geral.numero">

        <md-table-cell md-numeric>{{nota.geral.numero}}</md-table-cell>

        <md-table-cell>{{pessoas[nota.emitente].nome}}</md-table-cell>
        <md-table-cell>{{pessoas[nota.destinatario].nome}}</md-table-cell>

        <md-table-cell>{{nota.geral.naturezaOperacao}}</md-table-cell>
        <md-table-cell>{{nota.valor.total}}</md-table-cell>
      </md-table-row>
  </md-table>
</div>
</template>

<script>
import _ from 'lodash'
import { usuarioAtivo, lerNotasInput } from './services/firebase.service'

export default {
  data () {
    return {
      notas: {},
      pessoas: {}
    }
  },
  created () {
    usuarioAtivo(ativo => {
      if(!ativo) this.$router.push('/login')
    })
  },
  updated () {
    
  },
  methods: {
    ler (e) {
      if(e.target.files)
        lerNotasInput (e.target.files, (notas, pessoas) => {
          this.$data.notas = notas
          this.$data.pessoas = pessoas
        })
      
    }
  },
  computed: {
    ordenarNotas () {
      return _.orderBy(this.notas, 'geral.numero')
    },
    semNotas () {
      return _.isEmpty(this.notas)
    }
}
}
</script>

<style lang="scss" scoped>

</style>
