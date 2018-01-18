<template>
<div v-if="carregado">
  <div class="md-layout md-alignment-top-center" id="form">
    <div class="md-layout md-layout-item md-size-85" id="inner">
        <md-field class="md-layout-item md-size-20">
          <label>Número</label>
          <md-input v-model="empresaSelecionada.numero" @input="selecionaPorNumero" :disabled="numeroDesativo"></md-input>
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
          <label for="mes">MÊS</label>
          <md-select v-model="competenciaSelecionada.mes" name="mes" id="mes" @input="removerMovimento">
            <md-option v-for="mes in meses" v-bind:key="'mes' + mes.num" :value="mes.num">{{mes.nome}}</md-option>
          </md-select>
        </md-field>
        <md-field class="md-layout-item md-size-40">
          <label for="ano">ANO</label>
          <md-select v-model="competenciaSelecionada.ano" name="ano" id="ano" @input="removerMovimento">
            <md-option v-for="ano in anos" v-bind:key="'ano' + ano" :value="ano">{{ano}}</md-option>
          </md-select>
        </md-field>
        <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
          <md-button class="md-layout-item md-size-25 md-primary" @click="selecionarMovimento" :disabled="!tudoPreenchido">SELECIONAR</md-button>
          <md-button class="md-layout-item md-size-25 md-primary" @click="imprimirTabela" :disabled="!temMovimentos">IMPRIMIR</md-button>
        </div>
    </div>
  </div>

  <div class="md-layout md-alignment-top-center" id="tabela">
    <md-table v-if="!semMovimentos" class="md-layout-item md-size-90" ref="tabela">

      <md-table-toolbar>
        <h1 class="md-title">Movimento {{meses[parseInt(competenciaSelecionada.mes) - 1].nome}}/{{competenciaSelecionada.ano}} - {{empresaSelecionada.pessoa.nome}}</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head>Número</md-table-head>
        <md-table-head>Valor Nota Inicial</md-table-head>
        <md-table-head>Valor Nota Final</md-table-head>
        <md-table-head>Lucro</md-table-head>
        <md-table-head>Base ICMS</md-table-head>
        <md-table-head></md-table-head>
        <md-table-head>GNRE</md-table-head>
        <md-table-head>PIS</md-table-head>
        <md-table-head>COFINS</md-table-head>
        <md-table-head>CSLL</md-table-head>
        <md-table-head>IRPJ</md-table-head>
        <md-table-head>TOTAL</md-table-head>
      </md-table-row>

      <md-table-row v-for="(movimento, index) in movimentos" v-bind:key="index">
        <md-table-cell md-numeric><md-button class="md-icon-button" :disabled="numeroDesativo" @click="definirDeletar(index, pegaIndex(index))">{{parseInt(notas[movimento.notaFinal].geral.numero)}}</md-button></md-table-cell>
        <md-table-cell v-if="movimento.notaInicial"><nota-dialogo :chave="movimento.notaInicial">R${{notas[movimento.notaInicial].valor.total}}</nota-dialogo></md-table-cell>
        <md-table-cell v-else></md-table-cell>
        <md-table-cell v-if="notas[movimento.notaFinal]"><nota-dialogo :chave="movimento.notaFinal">R${{notas[movimento.notaFinal].valor.total}}</nota-dialogo></md-table-cell>
        <md-table-cell>R${{movimento.valores.lucro}}</md-table-cell>
        <md-table-cell>R${{movimento.valores.impostos.icms.baseDeCalculo}} </md-table-cell>
        <md-table-cell>R${{calculaIcmsTotal(movimento)}}</md-table-cell>
        <md-table-cell v-if="movimento.valores.impostos.icms.difal">R${{movimento.valores.impostos.icms.difal.destino}}</md-table-cell>
        <md-table-cell v-else></md-table-cell>
        <md-table-cell>R${{movimento.valores.impostos.pis}}</md-table-cell>
        <md-table-cell>R${{movimento.valores.impostos.cofins}}</md-table-cell>
        <md-table-cell>R${{movimento.valores.impostos.csll}}</md-table-cell>
        <md-table-cell>R${{movimento.valores.impostos.irpj}}</md-table-cell>
        <md-table-cell>R${{movimento.valores.impostos.total}}</md-table-cell>
      </md-table-row>

      <md-table-row>
        <md-table-head></md-table-head>
        <md-table-head></md-table-head>
        <md-table-head></md-table-head>
        <md-table-head></md-table-head>
        <md-table-head>TOTAIS IMPOSTOS</md-table-head>
        <md-table-head>R${{retornarTotais.icms}}</md-table-head>
        <md-table-head>R${{retornarTotais.gnre}}</md-table-head>
        <md-table-head>R${{retornarTotais.pis}}</md-table-head>
        <md-table-head>R${{retornarTotais.cofins}}</md-table-head>
        <md-table-head>R${{retornarTotais.csll}}</md-table-head>
        <md-table-head>R${{retornarTotais.irpj}}</md-table-head>
        <md-table-head>R${{retornarTotais.total}}</md-table-head>
      </md-table-row>
    </md-table>
  </div>

  <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />

  <md-dialog-confirm
      :md-active.sync="deletar.mostra"
      md-title="Excluir Movimento"
      :md-content="deletar.mensagem"
      md-confirm-text="DELETAR"
      md-cancel-text="CANCELAR"
      @md-cancel="deletar.mostra = false"
      @md-confirm="deletarMovimento" />

</div>
</template>
<script>
import { pegarDominio, usuarioAtivo, pegarPessoaId, pegarMovimentosMes, pegarNotaChave, excluirMovimento } from './services/firebase.service'
import notaDialogo from './notaDialogo'
import _ from 'lodash'
import { Printd } from 'printd'

export default {
  components: { notaDialogo },
  data () {
    return {
      deletar: {
        mostra: false,
        mensagem: null,
        movimentoId: null
      },
      numeroDesativo: false,
      carregado: false,
      erro: {
        mostra: false,
        mensagem: null
      },
      meses: [
        { num: '1', nome: 'Janeiro' },
        { num: '2', nome: 'Fevereiro' },
        { num: '3', nome: 'Abril' },
        { num: '4', nome: 'Março' },
        { num: '5', nome: 'Maio' },
        { num: '6', nome: 'Junho' },
        { num: '7', nome: 'Julho' },
        { num: '8', nome: 'Agosto' },
        { num: '9', nome: 'Setembro' },
        { num: '10', nome: 'Outubro' },
        { num: '11', nome: 'Novembro' },
        { num: '12', nome: 'Dezembro' }
      ],
      anos: [
        '2016',
        '2017',
        '2018'
      ],
      dominio: null,
      empresaSelecionada: {
        numero: null,
        pessoa: {}
      },
      competenciaSelecionada: {
        mes: null,
        ano: null
      },
      semMovimentos: true,
      movimentos: {},
      notas: {}
    }
  },
  created () {
    usuarioAtivo((ativo, usuario, tipoDominio) => {
      if (!ativo) {
        this.$router.push('/login')
      } else if (tipoDominio === 'unico') {
        pegarDominio((err, dominio) => {
          if (err) console.error(err)
          pegarPessoaId(dominio.empresa, (err, pessoa) => {
            if (err) console.error(err)

            this.$data.empresaSelecionada = {
              numero: '000',
              pessoa: pessoa
            }
            this.$data.empresaSelecionada.pessoa.cnpj = dominio.empresa
            this.$data.numeroDesativo = true
            this.$data.dominio = dominio
            this.$data.carregado = true
          })
        })
      } else {
        pegarDominio((err, dominio) => {
          if (err) console.error(err)
          this.$data.dominio = dominio
          this.$data.carregado = true
        })
      }
    })
  },
  methods: {
    calculaIcmsTotal (movimento) {
      let icms = movimento.valores.impostos.icms
      if (icms.difal) {
        return (parseFloat(icms.difal.origem) + parseFloat(icms.proprio)).toFixed(2)
      } else {
        return icms.proprio
      }
    },
    deletarMovimento () {
      let movimentos = this.$data.movimentos
      let movimentoId = this.$data.deletar.movimentoId
      delete movimentos[movimentoId]
      excluirMovimento(this.$data.empresaSelecionada.pessoa.cnpj, movimentoId, err => {
        if (err) console.error(err)
      })
    },
    definirDeletar (id, num) {
      this.$data.deletar.mensagem = `Tem certeza que deseja deletar o movimento ${num}?`
      this.$data.deletar.movimentoId = id
      this.$data.deletar.mostra = true
    },
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    },
    selecionaPorNumero (numero) {
      this.removerMovimento()
      if (this.$data.dominio.empresas[numero]) {
        let cnpj = this.$data.dominio.empresas[numero]
        pegarPessoaId(cnpj, (err, pessoa) => {
          if (err) {
            console.error(err)
          } else {
            pessoa.cnpj = cnpj
            this.$data.empresaSelecionada.pessoa = pessoa
            if (pessoa.temLiminar) {
              this.$data.aliquotaImpostos.csll = 0.0108
              this.$data.aliquotaImpostos.irpj = 0.012
            }
          }
        })
      } else {
        this.$data.empresaSelecionada.pessoa = {}
      }
    },
    selecionarMovimento () {
      let competencia = this.$data.competenciaSelecionada
      let mesEscrito = this.$data.meses[parseInt(competencia.mes) - 1].nome
      let pessoaEmpresa = this.$data.empresaSelecionada.pessoa
      let numeroEmpresa = this.$data.empresaSelecionada.numero

      pegarMovimentosMes(pessoaEmpresa.cnpj, competencia, (err, movimentos) => {
        if (err) console.error(err)

        if (_.isEmpty(movimentos)) {
          this.chamarMensagem(new Error(`Não foram encontrados movimentos na competência: ${mesEscrito}/${competencia.ano} da empresa Nº${numeroEmpresa} (${pessoaEmpresa.nome})`))
          this.$data.semMovimentos = true
        } else {
          this.$data.semMovimentos = false
          this.$data.movimentos = movimentos
          Object.keys(movimentos).forEach(key => {
            let chaveFinal = movimentos[key].notaFinal
            let chaveInicial = movimentos[key].notaInicial
            pegarNotaChave(chaveFinal, (err, notaFinal) => {
              if (err) console.error(err)
              pegarNotaChave(chaveInicial, (err, notaInicial) => {
                if (err) console.error(err)

                this.$data.notas = {
                  ...this.$data.notas,
                  [chaveFinal]: notaFinal,
                  [chaveInicial]: notaInicial
                }
              })
            })
          })
        }
      })
    },
    pegaIndex (index) {
      let movimentos = this.$data.movimentos
      return Object.keys(movimentos).indexOf(index) + 1
    },
    imprimirTabela () {
      let printer = new Printd()
      let tabela = this.$refs['tabela']
      let css = `  * {
          font-family: Helvetica, Arial, sans-serif;
        }
        .md-content {
          color: #333;
          text-align: center;
        }
        .md-table {
          width: 100%;
        }
        h1 {
          font-size: 20px;
        }
        table {
          color: #333;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 11px;
          width: 100%;
          border-collapse:collapse;
          border-spacing: 0;
        }

        td, th {
          border: 1px solid #333; /* No more visible border */
          height: 22px;
          transition: all 0.3s;  /* Simple transition for hover effect */
        }

        th {
            background: rgb(158, 158, 158);  /* Darken header a bit */
            font-weight: bold;
            font-size: 14px;
        }

        td {
            background: #FAFAFA;
            text-align: center;
        }

        button {
          border: 0;
          background: none;
          box-shadow: none;
          border-radius: 0px;
          font-weight: normal;
          font-size: 11px;
        }

        /* Cells in even rows (2,4,6...) are one color */
        tr:nth-child(even) td { background: rgb(218, 218, 218); }

        /* Cells in odd rows (1,3,5...) are another (excludes header cells)  */
        tr:nth-child(odd) td { background: #FEFEFE; }`

      console.log(tabela.$el.toString())
      this.$nextTick(() => {
        printer.print(tabela.$el, css, win => {
          win.print()
        })
      })
    },
    eObjeto (obj) {
      return _.isObject(obj)
    },
    removerMovimento () {
      this.$data.movimentos = {}
      this.$data.semMovimentos = true
    }
  },
  computed: {
    tudoPreenchido () {
      if (!_.isEmpty(this.$data.empresaSelecionada.pessoa) && this.$data.competenciaSelecionada.ano && this.$data.competenciaSelecionada.mes) {
        return true
      } else {
        return false
      }
    },
    temMovimentos () {
      return !_.isEmpty(this.$data.movimentos)
    },
    retornarTotais () {
      let movimentos = this.$data.movimentos
      let totais = {
        icms: 0,
        irpj: 0,
        csll: 0,
        pis: 0,
        cofins: 0,
        gnre: 0
      }

      Object.keys(movimentos).forEach(key => {
        let movimento = movimentos[key]

        totais.icms += parseFloat(this.calculaIcmsTotal(movimento))
        totais.csll += parseFloat(movimento.valores.impostos.csll)
        totais.pis += parseFloat(movimento.valores.impostos.pis)
        totais.irpj += parseFloat(movimento.valores.impostos.irpj)
        totais.cofins += parseFloat(movimento.valores.impostos.cofins)
        if (movimento.valores.impostos.icms.difal) {
          totais.gnre += parseFloat(movimento.valores.impostos.icms.difal.destino)
        }
      })

      totais.total = totais.icms + totais.csll + totais.pis + totais.irpj + totais.cofins + totais.gnre

      totais.icms = (totais.icms).toFixed(2)
      totais.csll = (totais.csll).toFixed(2)
      totais.pis = (totais.pis).toFixed(2)
      totais.irpj = (totais.irpj).toFixed(2)
      totais.cofins = (totais.cofins).toFixed(2)
      totais.gnre = (totais.gnre).toFixed(2)

      return totais
    }
  }
}
</script>

<style lang="scss" scoped>
#form {
  margin-top: 5%;
  margin-bottom: 2%;
}
#tabela {
  margin-bottom: 2%;
}
#inner {
  padding: 1%;
  background-color: rgb(255, 255, 255)
}
</style>
