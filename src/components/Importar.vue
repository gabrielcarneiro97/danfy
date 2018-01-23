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
    <md-table class="md-layout-item md-size-90" v-if="!semNotas">

      <md-table-toolbar>
        <h1 class="md-title">Notas de Compra e Venda</h1>
      </md-table-toolbar>

      <md-table-row>
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

     <md-table class="md-layout-item md-size-90" v-if="!semNotasServico">

      <md-table-toolbar>
        <h1 class="md-title">Notas de Serviço</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head md-numeric>Número</md-table-head>
        <md-table-head>Emitente</md-table-head>
        <md-table-head>Destinatário</md-table-head>
        <md-table-head>Valor</md-table-head>
        <md-table-head>Status</md-table-head>
      </md-table-row>

      <md-table-row v-for="notaServico in ordenarNotasServico" v-bind:key="notaServico.emitente + notaServico.geral.numero">

        <md-table-cell md-numeric>{{notaServico.geral.numero}}</md-table-cell>

        <md-table-cell>{{pessoas[notaServico.emitente].nome}}</md-table-cell>
        <md-table-cell>{{pessoas[notaServico.destinatario].nome}}</md-table-cell>
        <md-table-cell>{{notaServico.valor.servico}}</md-table-cell>
        <md-table-cell>{{notaServico.geral.status}}</md-table-cell>
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
      <md-field class="md-layout-item md-size-50">
        <label>NÚMERO</label>
        <md-input v-model="empresaParaAdicionar.num"></md-input>
      </md-field>
      <div class="md-layout-item md-size-50">
        <md-checkbox v-model="temLiminar">Liminar de Redução</md-checkbox>
      </div>
      <md-divider></md-divider>
      <md-field class="md-layout-item md-size-50">
        <label>IRPJ</label>
        <md-input v-model="aliquotas.irpj" disabled></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>CSLL</label>
        <md-input v-model="aliquotas.csll" disabled></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>PIS</label>
        <md-input v-model="aliquotas.pis" disabled></md-input>
      </md-field>
      <md-field class="md-layout-item md-size-50">
        <label>COFINS</label>
        <md-input v-model="aliquotas.cofins" disabled></md-input>
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
      <div class="md-layout-item md-size-100">
        <md-radio v-model="aliquotas.tributacao" value="SN">Simples Nacional</md-radio>
        <md-radio v-model="aliquotas.tributacao" value="LP">Lucro Presumido</md-radio>
      </div>
      <div class="md-layout-item md-size-100">
        <md-radio v-model="aliquotas.formaPagamentoTrimestrais" value="adiantamento">Adiantamento</md-radio>
        <md-radio v-model="aliquotas.formaPagamentoTrimestrais" value="acumulado">Acumulado por trimestre</md-radio>
        <md-radio v-model="aliquotas.formaPagamentoTrimestrais" value="cotas">Pagamento em cotas</md-radio>        
      </div>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="mostraImpostos = false; mostra = true">CANCELAR</md-button>
      <md-button class="md-primary" @click="gravarImpostosEDominio" :disabled="!podeAdicionar">ADICIONAR</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog-confirm
      v-if="empresaParaAdicionar.cnpj"
      :md-active.sync="mostraConfirma"
      md-title="Empresa adicionada com sucesso"
      :md-content="'Empresa: ' + pessoas[empresaParaAdicionar.cnpj].nome + ' Número: ' + empresaParaAdicionar.num"
      md-confirm-text="OK"
      md-cancel-text=""
      @md-confirm="confirmarDialogo" />
</div>
</template>

<script>
import _ from 'lodash'
import store from '../store'
import { usuarioAtivo, lerNotasInput, adicionarDominioEImpostos, limparNotasStore, limparNotasServicoStore } from './services'

export default {
  data () {
    return {
      notas: {},
      notasServico: {},
      pessoas: {},
      foraDominio: {},
      aliquotasPadrao: {
        formaPagamentoTrimestrais: '',
        tributacao: '',
        icms: {
          aliquota: 0.18,
          reducao: 0.2778
        },
        pis: 0.0065,
        cofins: 0.03,
        csll: 0.0288,
        irpj: 0.048,
        iss: 0.03
      },
      temLiminar: false,
      aliquotas: {
        formaPagamentoTrimestrais: '',
        tributacao: '',
        icms: {
          aliquota: 0.18,
          reducao: 0.2778
        },
        pis: 0.0065,
        cofins: 0.03,
        csll: 0.0288,
        irpj: 0.048,
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
        limparNotasServicoStore()
      }
    })
  },
  updated () {

  },
  methods: {
    ler (e) {
      if (e.target.files) {
        lerNotasInput(e.target.files, (notas, notasServico, pessoas) => {
          this.$data.notas = notas
          this.$data.notasServico = notasServico
          this.$data.pessoas = pessoas
          this.$data.clicaEnviar = true
          this.$data.foraDominio = {}
          let dominio = store.getState().dominio

          Object.keys(pessoas).forEach(keyPessoa => {
            if (keyPessoa.length === 11) return 0

            let empresas = dominio.empresas ? dominio.empresas : {}

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
        this.proximaPagina()
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
      this.proximaPagina()
    },
    abrirImpostosEDominio (empresa) {
      let padrao = this.$data.aliquotasPadrao
      this.$data.aliquotas.iss = padrao.iss
      this.$data.aliquotas.irpj = padrao.irpj
      this.$data.aliquotas.csll = padrao.csll
      this.$data.aliquotas.pis = padrao.pis
      this.$data.aliquotas.cofins = padrao.cofins
      this.$data.aliquotas.icms.reducao = padrao.icms.reducao
      this.$data.aliquotas.icms.aliquota = padrao.icms.aliquota

      this.$data.mostra = false
      this.$data.mostraImpostos = true
      this.$data.empresaParaAdicionar = empresa
    },
    gravarImpostosEDominio () {
      let empresa = this.$data.empresaParaAdicionar
      let aliquotas = this.$data.aliquotas
      empresa.aliquotas = {
        formaPagamentoTrimestrais: aliquotas.formaPagamentoTrimestrais,
        tributacao: aliquotas.tributacao,
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
    proximaPagina () {
      this.$router.push('/conciliarNotas')
    },
    confirmarDialogo () {
      this.$data.mostraConfirma = false
      if (!_.isEmpty(this.$data.foraDominio)) {
        this.$data.mostra = true
      } else {
        this.proximaPagina()
      }
    }
  },
  computed: {
    ordenarNotas () {
      return _.orderBy(this.$data.notas, 'geral.numero')
    },
    ordenarNotasServico () {
      return _.orderBy(this.$data.notasServico, 'geral.numero')
    },
    semNotas () {
      return _.isEmpty(this.$data.notas)
    },
    semNotasServico () {
      return _.isEmpty(this.$data.notasServico)
    },
    podeAdicionar () {
      if (this.$data.empresaParaAdicionar.num && this.$data.aliquotas.tributacao !== '' && this.$data.aliquotas.formaPagamentoTrimestrais) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    temLiminar () {
      if (this.$data.temLiminar) {
        this.$data.aliquotas.csll = 0.0108
        this.$data.aliquotas.irpj = 0.012
      } else {
        this.$data.aliquotas.csll = 0.0288
        this.$data.aliquotas.irpj = 0.048
      }
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
