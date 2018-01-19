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

      <md-table>
        <md-table-row>
          <md-table-head >Nome</md-table-head>
          <md-table-head>CNPJ</md-table-head>
          <md-table-head>Adicionar?</md-table-head>
        </md-table-row>

        <md-table-row v-for="empresa in foraDominio" v-bind:key="empresa.cnpj + 'adicionar'">

          <md-table-cell>{{pessoas[empresa.cnpj].nome}}</md-table-cell>

          <md-table-cell>{{empresa.cnpj}}</md-table-cell>

          <md-table-cell><md-button @click="abrirImpostosEDominio(empresa)">ADICIONAR</md-button></md-table-cell>
        </md-table-row>
      </md-table>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="proximo">PRÓXIMO</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="mostraImpostos" v-if="empresaParaAdicionar.cnpj">
    <md-dialog-title>{{pessoas[empresaParaAdicionar.cnpj].nome}}</md-dialog-title>
    <md-dialog-content class="md-layout">
      <md-field class="md-layout-item md-size-100">
        <label>NÚMERO</label>
        <md-input v-model="empresaParaAdicionar.num"></md-input>
      </md-field>
      <md-divider></md-divider>
      <md-field class="md-layout-item md-size-50">
        <label>IRPJ</label>
        <md-input v-model="aliquotas.irpj"></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>CSLL</label>
        <md-input v-model="aliquotas.csll"></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>PIS</label>
        <md-input v-model="aliquotas.pis"></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>COFINS</label>
        <md-input v-model="aliquotas.cofins"></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>ICMS</label>
        <md-input v-model="aliquotas.icms.aliquota"></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>REDUÇÃO NO ICMS</label>
        <md-input v-model="aliquotas.icms.reducao"></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-100">
        <label>ISS</label>
        <md-input v-model="aliquotas.iss"></md-input>
      </md-field>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="mostraImpostos = false; mostra = true">CANCELAR</md-button>
      <md-button class="md-primary" @click="gravarImpostosEDominio">ADICIONAR</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog-confirm
      v-if="empresaParaAdicionar.cnpj"
      :md-active.sync="mostraConfirma"
      md-title="Empresa adicionada com sucesso"
      :md-content="'Empresa: ' + pessoas[empresaParaAdicionar.cnpj].nome + ' Número: ' + empresaParaAdicionar.num"
      md-confirm-text="OK"
      md-cancel-text=""
      @md-confirm="mostraConfirma = false; mostra = true" />
</div>
</template>

<script>
import _ from 'lodash'
import store from '../store'
import { usuarioAtivo, lerNotasInput, adicionarDominioEImpostos, gravarPessoas, gravarNotas, limparNotasStore } from './services/firebase.service'

export default {
  data () {
    return {
      notas: {},
      pessoas: {},
      foraDominio: {},
      aliquotasPadrao: {
        icms: {
          aliquota: 0.18,
          reducao: 0.2778
        },
        pis: 0.0065,
        cofins: 0.03,
        csll: 0.0288,
        irpj: 0.012,
        iss: 0.03
      },
      aliquotas: {
        icms: {
          aliquota: 0.18,
          reducao: 0.2778
        },
        pis: 0.0065,
        cofins: 0.03,
        csll: 0.0288,
        irpj: 0.012,
        iss: 0.03
      },
      empresaParaAdicionar: {},
      mostra: false,
      mostraConfirma: false,
      mostraImpostos: false,
      clicaEnviar: false
    }
  },
  created () {
    usuarioAtivo((ativo, user, tipoDominio) => {
      if (!ativo) {
        this.$router.push('/login')
      } else if (tipoDominio !== 'mult') {
        this.$router.push('/mostrarMovimentos')
      } else {
        limparNotasStore()
      }
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
          this.$data.foraDominio = {}
          let dominio = store.getState().dominio

          Object.keys(pessoas).forEach(keyPessoa => {
            if (keyPessoa.length === 11) return 0

            let empresas = dominio.empresas

            let jaNoDominio = Object.keys(empresas).some((keyEmpresa, index) => {
              return empresas[keyEmpresa] === keyPessoa
            })

            if (!jaNoDominio) {
              this.$data.foraDominio[keyPessoa] = {cnpj: keyPessoa, num: null}
            }
          })
        })
      }
    },
    enviar () {
      if (_.isEmpty(this.$data.foraDominio)) {
        this.gravarEProximaPagina()
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
    proximo () {
      this.gravarEProximaPagina()
    },
    abrirImpostosEDominio (empresa) {
      this.$data.mostra = false
      this.$data.aliquotas = this.$data.aliquotasPadrao
      this.$data.mostraImpostos = true
      this.$data.empresaParaAdicionar = empresa
    },
    gravarImpostosEDominio () {
      let empresa = this.$data.empresaParaAdicionar
      let aliquotas = this.$data.aliquotas
      empresa.aliquotas = {
        icms: {
          aliquota: parseFloat(aliquotas.icms.aliquota.toString().replace(',', '.')),
          reducao: parseFloat(aliquotas.icms.reducao.toString().replace(',', '.'))
        },
        pis: parseFloat(aliquotas.pis.toString().replace(',', '.')),
        cofins: parseFloat(aliquotas.cofins.toString().replace(',', '.')),
        csll: parseFloat(aliquotas.csll.toString().replace(',', '.')),
        irpj: parseFloat(aliquotas.irpj.toString().replace(',', '.')),
        iss: parseFloat(aliquotas.iss.toString().replace(',', '.'))
      }

      adicionarDominioEImpostos(empresa, err => {
        if (err) {
          console.error(err)
        } else {
          delete this.$data.foraDominio[empresa.cnpj]
          this.$data.mostraImpostos = false
          this.$data.mostraConfirma = true
        }
      })
    },
    gravarEProximaPagina () {
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
