<template>
<div>
  <md-field>
    <label>Notas</label>
    <md-file multiple @change="ler" accept=".xml" />
  </md-field>
  <md-progress-bar md-mode="determinate" :md-value="status"></md-progress-bar>

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

        <md-table-cell>{{empresas[nota.emitente].nome}}</md-table-cell>

        <md-table-cell v-if="nota.destinatario.length == 11">{{pessoas[nota.destinatario].nome}}</md-table-cell>
        <md-table-cell v-else>{{empresas[nota.destinatario].nome}}</md-table-cell>

        <md-table-cell>{{nota.geral.naturezaOperacao}}</md-table-cell>
        <md-table-cell>{{nota.valor.total}}</md-table-cell>
      </md-table-row>
  </md-table>
</div>
</template>

<script>
import _ from 'lodash'
import { xml2js } from 'xml-js'
import { usuarioAtivo } from './services/firebase.service'
import store from '../store'
import { adicionarNota, adicionarPessoa, adicionarEmpresa, limparNotas, limparPessoas, limparEmpresas } from '../store/actions'

var jaLeu = 0
var todosArquivos = undefined

export default {
  data () {
    return {
      status: 0,
      arquivos: null,
      notas: {},
      empresas: {},
      pessoas: {}
    }
  },
  created () {
    usuarioAtivo(ativo => {
      if(!ativo) this.$router.push('/login')
    })
  },
  updated () {
    if(todosArquivos) this.$data.status = jaLeu/todosArquivos * 100
  },
  methods: {
    ler (e) {
      this.$data.arquivos = e.target.files

      jaLeu = 0

      this.$data.notas = {}
      store.dispatch(limparNotas())
      this.$data.pessoas = {}
      store.dispatch(limparPessoas())
      this.$data.empresas = {}
      store.dispatch(limparEmpresas())

      let arquivos = this.$data.arquivos
      todosArquivos = arquivos.length

      for (let index = 0; index < todosArquivos; index++) {
        let leitor = new FileReader()

        let arquivo = arquivos[index]       

        leitor.readAsText(arquivo)
          
        leitor.onload = () => {
          
          jaLeu++

          let dados = leitor.result
          let obj = xml2js(dados, {compact: true})

          if(!obj.nfeProc) return 0
          if(!obj.nfeProc.NFe) return 0
          if(!obj.nfeProc.NFe.Signature) return 0

          let info = obj.nfeProc.NFe.infNFe

          if(!info.ide.tpAmb['_text'] === '1') return 0

          let notaId = info['_attributes'].Id.split('NFe')[1]

          let emit = info.emit
          let emitenteId = emit.CNPJ['_text']
          let emitente = {
            nome: emit.xNome['_text'],
            endereco: {
              logradouro: emit.enderEmit.xLgr['_text'],
              numero: emit.enderEmit.nro['_text'],
              complemento: emit.enderEmit.xCpl ? emit.enderEmit.xCpl['_text'] : '',
              bairro: emit.enderEmit.xBairro['_text'],
              municipio: {
                codigo: emit.enderEmit.cMun['_text'],
                nome: emit.enderEmit.xMun['_text']
              },
              estado: emit.enderEmit.UF['_text'],
              pais: {
                codigo: emit.enderEmit.cPais['_text'],
                nome: emit.enderEmit.xPais['_text']
              },
              cep: emit.enderEmit.CEP['_text']
            }
          }

          let dest = info.dest
          let destinatarioId = dest.CPF ? dest.CPF['_text'] : dest.CNPJ['_text']
          let destinatario = {
            nome: dest.xNome['_text'],
            endereco: {
              logradouro: dest.enderDest.xLgr['_text'],
              numero: dest.enderDest.nro['_text'],
              complemento: dest.enderDest.xCpl ? dest.enderDest.xCpl['_text'] : '',
              bairro: dest.enderDest.xBairro['_text'],
              municipio: {
                codigo: dest.enderDest.cMun['_text'],
                nome: dest.enderDest.xMun['_text']
              },
              estado: dest.enderDest.UF['_text'],
              pais: {
                codigo: dest.enderDest.cPais['_text'],
                nome: dest.enderDest.xPais['_text']
              },
              cep: dest.enderDest.CEP['_text']
            }
          }

          let nota = {
            emitente: emitenteId,
            destinatario: destinatarioId,
            geral: {
              dataHora: info.ide.dhSaiEnt['_text'],
              naturezaOperacao: info.ide.natOp['_text'],
              numero: info.ide.cNF['_text'],
              tipo: info.ide.tpNF['_text']
            },
            valor: {
              total: info.total.ICMSTot.vNF['_text']
            }
          }

          let det = info.det
          let produtos = {}

          if(!Array.isArray(det)){
            let prod = det.prod
            let codigo = prod.cProd['_text']

            let produto = {
              descricao: prod.xProd['_text'],
              quantidade: {
                numero: prod.qCom['_text'],
                tipo: prod.uCom['_text']
              },
              valor: {
                total: prod.vProd['_text']
              }
            }

            produtos = {
              ...produtos, 
              [codigo]: produto
            }

          }
          else {
            det.forEach(val => {
              let prod = val.prod
              let codigo = prod.cProd['_text']

              let produto = {
                descricao: prod.xProd['_text'],
                quantidade: {
                  numero: prod.qCom['_text'],
                  tipo: prod.uCom['_text']
                },
                valor: {
                  total: prod.vProd['_text']
                }
              }

              produtos = {
                ...produtos, 
                [codigo]: produto
              }
            })
          }

          nota.produtos = produtos

          nota.complementar = {
            notaReferencia: info.ide.NFref ? info.ide.NFref.refNFe['_text'] : undefined
          }

          this.$data.notas = {
            ...this.$data.notas,
            [notaId]: nota
          }
          store.dispatch(adicionarNota(notaId, nota))
          
          this.$data.empresas = {
            ...this.$data.empresas,
            [emitenteId]: emitente
          }

          store.dispatch(adicionarEmpresa(emitenteId, emitente))

          if(destinatarioId.length === 11) {
            this.$data.pessoas = {
              ...this.$data.pessoas,
              [destinatarioId]: destinatario
            }

            store.dispatch(adicionarPessoa(destinatarioId, destinatario))

          } else {
            this.$data.empresas = {
              ...this.$data.empresas,
              [destinatarioId]: destinatario
            }

            store.dispatch(adicionarEmpresa(destinatarioId, destinatarios))
            
          }
        console.log(store.getState())
        //  FINAL leitor.onload
        }
      }

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
