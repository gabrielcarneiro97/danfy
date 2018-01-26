<template>
<div v-if="carregado">
  <div class="md-layout md-alignment-top-center" id="form">
    <div class="md-layout md-layout-item md-size-90" id="inner">
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
        <md-field class="md-layout-item md-size-100">
          <label>Forma de Pagamento Impostos Trimestrais</label>
          <md-input v-if="empresaSelecionada.pessoa.formaPagamento === 'cotas'" v-model="cotas" disabled></md-input>
          <md-input v-if="empresaSelecionada.pessoa.formaPagamento === 'adiantamento'" v-model="adiantamento" disabled></md-input>
          <md-input v-if="empresaSelecionada.pessoa.formaPagamento === 'acumulado'" v-model="acumulado" disabled></md-input>          
        </md-field>
        <md-field class="md-layout-item md-size-30">
          <label for="mes">MÊS</label>
          <md-select v-model="competenciaSelecionada.mes" name="mes" id="mes" @input="removerMovimentosEServicos">
            <md-option v-for="mes in meses" v-bind:key="'mes' + mes.num" :value="mes.num">{{mes.nome}}</md-option>
          </md-select>
        </md-field>
        <md-field class="md-layout-item md-size-30">
          <label for="ano">ANO</label>
          <md-select v-model="competenciaSelecionada.ano" name="ano" id="ano" @input="removerMovimentosEServicos">
            <md-option v-for="ano in anos" v-bind:key="'ano' + ano" :value="ano">{{ano}}</md-option>
          </md-select>
        </md-field>
        <md-field class="md-layout-item md-size-40">
          <label for="tipoTabela">ESCOLHA A TABELA</label>
          <md-select v-model="tipoTabela" name="tipoTabela" id="tipoTabela">
            <md-option value="movimentos">VENDAS</md-option>
            <md-option value="servicos">SERVIÇOS</md-option>
            <md-option value="acumulado">ACUMULADO</md-option>
            
          </md-select>
        </md-field>
        <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
          <md-button class="md-layout-item md-size-25 md-primary" @click="selecionarMovimento" :disabled="!tudoPreenchido">SELECIONAR</md-button>
          <md-button class="md-layout-item md-size-25 md-primary" @click="imprimirTabela" :disabled="!temMovimentos">IMPRIMIR</md-button>
        </div>
    </div>
  </div>

  <div class="md-layout md-alignment-top-center" id="tabela" ref="tabelas">
    <md-table v-if="temMovimentos" class="md-layout-item md-size-90" v-show="tipoTabela === 'movimentos' || mostraTudo" ref="tabelaMovimentos">

      <md-table-toolbar>
        <h1 class="md-title">Vendas {{meses[parseInt(competenciaSelecionada.mes) - 1].nome}}/{{competenciaSelecionada.ano}} - {{empresaSelecionada.pessoa.nome}}</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head rowspan="2">Número</md-table-head>
        <md-table-head rowspan="2">Valor Nota Inicial</md-table-head>
        <md-table-head rowspan="2">Valor Nota Final</md-table-head>
        <md-table-head rowspan="2">Tipo de Movimento</md-table-head>
        <md-table-head rowspan="2">Lucro</md-table-head>
        <md-table-head rowspan="2">Base ICMS</md-table-head>
        <md-table-head rowspan="2">ICMS</md-table-head>
        <md-table-head colspan="2" style="text-align: center">DIFAL</md-table-head>
        <md-table-head rowspan="2">PIS</md-table-head>
        <md-table-head rowspan="2">COFINS</md-table-head>
        <md-table-head rowspan="2">CSLL</md-table-head>
        <md-table-head rowspan="2">IRPJ</md-table-head>
        <md-table-head rowspan="2">TOTAL</md-table-head>
      </md-table-row>

      <md-table-row>
        <md-table-head>ORIGINÁRIO</md-table-head>
        <md-table-head>DESTINO (GNRE)</md-table-head>        
      </md-table-row>

      <md-table-row v-for="(movimento, index) in ordenarMovimentos" v-bind:key="index">
        <md-table-cell md-numeric v-if="notas[movimento.notaFinal]"><md-button class="md-icon-button" :disabled="numeroDesativo" @click="definirDeletar(index, pegaIndex(index))">{{parseInt(notas[movimento.notaFinal].geral.numero)}}</md-button></md-table-cell>
        <md-table-cell v-if="notas[movimento.notaInicial]"><nota-dialogo :chave="movimento.notaInicial">{{R$(notas[movimento.notaInicial].valor.total)}}</nota-dialogo></md-table-cell>
        <md-table-cell v-else><md-button disabled>SEM NOTA INICIAL</md-button></md-table-cell>       
        <md-table-cell v-if="notas[movimento.notaFinal]"><nota-dialogo :chave="movimento.notaFinal">{{R$(notas[movimento.notaFinal].valor.total)}}</nota-dialogo></md-table-cell>
        <md-table-cell v-else></md-table-cell>
        <md-table-cell v-if="notas[movimento.notaFinal]">{{retornarTipo(notas[movimento.notaFinal].geral.cfop)}}</md-table-cell>
        <md-table-cell v-else></md-table-cell>        
        <md-table-cell>{{R$(movimento.valores.lucro)}}</md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.icms.baseDeCalculo)}} </md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.icms.proprio)}}</md-table-cell>
        <md-table-cell v-if="movimento.valores.impostos.icms.difal">{{R$(movimento.valores.impostos.icms.difal.origem)}}</md-table-cell>
        <md-table-cell v-else></md-table-cell>
        <md-table-cell v-if="movimento.valores.impostos.icms.difal">{{R$(movimento.valores.impostos.icms.difal.destino)}}</md-table-cell>
        <md-table-cell v-else></md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.pis)}}</md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.cofins)}}</md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.csll)}}</md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.irpj)}}</md-table-cell>
        <md-table-cell>{{R$(movimento.valores.impostos.total)}}</md-table-cell>
      </md-table-row>

      <md-table-row>
        <md-table-head colspan="2" style="text-align:center">TOTAIS</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.totalSaida)}}</md-table-head>
        <md-table-head></md-table-head>        
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.lucro)}}</md-table-head>
        <md-table-head colspan="1" style="text-align:center">IMPOSTOS</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.icms.proprio)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.icms.difal.origem)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.icms.difal.destino)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.pis)}}</md-table-head>        
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.cofins)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.csll)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.irpj)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].movimentos.impostos.total)}}</md-table-head>
      </md-table-row>
      <md-table-row>
        <md-table-head colspan="4" style="background-color: white; border:none"></md-table-head>
        <md-table-head>GUIA ICMS</md-table-head>
        <md-table-head colspan="2" style="text-align: center">{{R$(parseFloat(trimestre[competenciaSelecionada.mes].movimentos.impostos.icms.proprio) + parseFloat(trimestre[competenciaSelecionada.mes].movimentos.impostos.icms.difal.origem))}}</md-table-head>        
      </md-table-row>
    </md-table>

    <md-table v-if="temServicos" class="md-layout-item md-size-90" v-show="tipoTabela === 'servicos' || mostraTudo" ref="tabelaServicos">
      <md-table-toolbar>
        <h1 class="md-title">Servicos {{meses[parseInt(competenciaSelecionada.mes) - 1].nome}}/{{competenciaSelecionada.ano}} - {{empresaSelecionada.pessoa.nome}}</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head rowspan="2">Nota</md-table-head>
        <md-table-head rowspan="2">Valor Serviço</md-table-head>
        <md-table-head rowspan="2">Status</md-table-head>        
        <md-table-head colspan="6" style="text-align:center">RETENÇÕES</md-table-head>
        <md-table-head rowspan="2">ISS</md-table-head>
        <md-table-head rowspan="2">PIS</md-table-head>
        <md-table-head rowspan="2">COFINS</md-table-head>
        <md-table-head rowspan="2">CSLL</md-table-head>
        <md-table-head rowspan="2">IRPJ</md-table-head>
        <md-table-head rowspan="2">TOTAL</md-table-head>
      </md-table-row>

      <md-table-row>
        <md-table-head>ISS</md-table-head>
        <md-table-head>PIS</md-table-head>
        <md-table-head>COFINS</md-table-head>
        <md-table-head>CSLL</md-table-head>
        <md-table-head>IRPJ</md-table-head>
        <md-table-head>TOTAL</md-table-head>
      </md-table-row>

      <md-table-row v-for="(servico, index) in servicos" v-bind:key="index">
        <md-table-cell md-numeric v-if="notasServico[servico.nota]"><md-button class="md-icon-button" :disabled="numeroDesativo" @click="definirDeletarServico(index, pegaIndexServico(index))">{{parseInt(notasServico[servico.nota].geral.numero.replace(competenciaSelecionada.ano, ''))}}</md-button></md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.baseDeCalculo)}}</md-table-cell>
        <md-table-cell>{{notasServico[servico.nota].geral.status}}</md-table-cell>        
        <md-table-cell>{{R$(servico.valores.impostos.retencoes.iss)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.retencoes.pis)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.retencoes.cofins)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.retencoes.csll)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.retencoes.irpj)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.retencoes.total)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.iss)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.pis)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.cofins)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.csll)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.irpj)}}</md-table-cell>
        <md-table-cell>{{R$(servico.valores.impostos.total)}}</md-table-cell>
      </md-table-row>

      <md-table-row>
        <md-table-head colspan="3">TOTAIS IMPOSTOS</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.retencoes.iss)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.retencoes.pis)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.retencoes.cofins)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.retencoes.csll)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.retencoes.irpj)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.retencoes.total)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.iss)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.pis)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.cofins)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.csll)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.irpj)}}</md-table-head>
        <md-table-head>{{R$(trimestre[competenciaSelecionada.mes].servicos.impostos.total)}}</md-table-head>
      </md-table-row>
    </md-table>

    <md-table class="md-layout-item md-size-90" v-show="tipoTabela === 'acumulado' || mostraTudo" v-if="temAcumulado">
      <md-table-toolbar>
        <h1 class="md-title">Guias Mensais {{meses[parseInt(competenciaSelecionada.mes) - 1].nome}}/{{competenciaSelecionada.ano}} - {{empresaSelecionada.pessoa.nome}}</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head>ISS</md-table-head>
        <md-table-head>ICMS</md-table-head>
        <md-table-head>PIS</md-table-head>
        <md-table-head>COFINS</md-table-head>        
        <md-table-head v-if="empresaSelecionada.pessoa.formaPagamento === 'adiantamento'">CSLL</md-table-head>
        <md-table-head v-if="(parseInt(competenciaSelecionada.mes) % 3 === 0) && empresaSelecionada.pessoa.formaPagamento === 'adiantamento'">IRPJ + ADICIONAL</md-table-head>    
        <md-table-head v-else-if="empresaSelecionada.pessoa.formaPagamento === 'adiantamento'">IRPJ</md-table-head>        
      </md-table-row>

      <md-table-row>
        <md-table-cell>{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.iss - trimestre[competenciaSelecionada.mes].totais.impostos.retencoes.iss)}}</md-table-cell>
        <md-table-cell>{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.icms.proprio + trimestre[competenciaSelecionada.mes].totais.impostos.icms.difal.origem)}}</md-table-cell>
        <md-table-cell>{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.pis - trimestre[competenciaSelecionada.mes].totais.impostos.retencoes.pis)}}</md-table-cell>
        <md-table-cell>{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.cofins - trimestre[competenciaSelecionada.mes].totais.impostos.retencoes.cofins)}}</md-table-cell>
        <md-table-cell v-if="empresaSelecionada.pessoa.formaPagamento === 'adiantamento'">{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.csll - trimestre[competenciaSelecionada.mes].totais.impostos.retencoes.csll)}}</md-table-cell>        
        <md-table-cell v-if="(parseInt(competenciaSelecionada.mes) % 3 === 0) && empresaSelecionada.pessoa.formaPagamento === 'adiantamento'">{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.irpj - trimestre[competenciaSelecionada.mes].totais.impostos.retencoes.irpj + trimestre.totais.impostos.adicionalIr)}}</md-table-cell>
        <md-table-cell v-else-if="empresaSelecionada.pessoa.formaPagamento === 'adiantamento'">{{R$(trimestre[competenciaSelecionada.mes].totais.impostos.irpj - trimestre[competenciaSelecionada.mes].totais.impostos.retencoes.irpj)}}</md-table-cell>      
      </md-table-row>


    </md-table>

    <md-table class="md-layout-item md-size-90 meia-tabela" v-show="tipoTabela === 'acumulado' || mostraTudo" v-if="temAcumulado" ref="tabelaTrimestre">
      <md-table-toolbar>
        <h1 class="md-title">Acumulado - {{empresaSelecionada.pessoa.nome}}</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head>MÊS</md-table-head>
        <md-table-head>CSLL</md-table-head>
        <md-table-head>IRPJ</md-table-head>
      </md-table-row>

      <md-table-row v-for="(mes, index) in trimestre" v-if="index !== 'totais'" v-bind:key="index + 'totais'">
        <md-table-cell>{{pegarMes(index)}}</md-table-cell>
        <md-table-cell>{{R$(mes.totais.impostos.csll - mes.totais.impostos.retencoes.csll)}}</md-table-cell>
        <md-table-cell>{{R$(mes.totais.impostos.irpj - mes.totais.impostos.retencoes.irpj)}}</md-table-cell>
      </md-table-row>

      <md-table-row v-if="(parseInt(competenciaSelecionada.mes) % 3 === 0)">
        <md-table-cell>Adicionais</md-table-cell>
        <md-table-cell>0,00</md-table-cell>
        <md-table-cell>{{R$(trimestre.totais.impostos.adicionalIr)}}</md-table-cell>        
      </md-table-row>

      <md-table-row>
        <md-table-head>Trimestre</md-table-head>
        <md-table-head>{{R$(trimestre.totais.impostos.csll - trimestre.totais.impostos.retencoes.csll)}}</md-table-head>
        <md-table-head>{{R$(trimestre.totais.impostos.irpj - trimestre.totais.impostos.retencoes.irpj + trimestre.totais.impostos.adicionalIr)}}</md-table-head>
      </md-table-row>
    </md-table>

    <md-table class="md-layout-item md-size-90 meia-tabela" v-show="tipoTabela === 'acumulado' || mostraTudo" v-if="temAcumulado && empresaSelecionada.pessoa.formaPagamento === 'cotas' && (parseInt(competenciaSelecionada.mes) % 3 === 0)">
      <md-table-toolbar>
        <h1 class="md-title">Cotas - {{empresaSelecionada.pessoa.nome}}</h1>
      </md-table-toolbar>

      <md-table-row>
        <md-table-head>Nº</md-table-head>
        <md-table-head>CSLL</md-table-head>
        <md-table-head>IRPJ</md-table-head>
      </md-table-row>

      <md-table-row v-for="numero in [1, 2, 3]" v-bind:key="numero + 'cota'">
        <md-table-cell>{{numero}}</md-table-cell>
        <md-table-cell v-if="calcularCotas.cotaCsll.numero >= numero">{{R$(calcularCotas.cotaCsll.valor)}}</md-table-cell>
        <md-table-cell v-else>0,00</md-table-cell>
        <md-table-cell v-if="calcularCotas.cotaIr.numero >= numero">{{R$(calcularCotas.cotaIr.valor)}}</md-table-cell>
        <md-table-cell v-else>0,00</md-table-cell>        
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
      @md-confirm="escolherDeletar" />

</div>
</template>
<script>
import { pegarDominio, usuarioAtivo, pegarPessoaId, pegarMovimentosMes, pegarServicosMes,
  pegarNotaChave, pegarNotaServicoChave, excluirMovimento, excluirServico, totaisTrimestrais,
  R$, pegarEmpresaImpostos, retornarTipo, cursorCarregando, cursorNormal } from './services'
import notaDialogo from './notaDialogo'
import _ from 'lodash'
import { Printd } from 'printd'

export default {
  components: {
    notaDialogo
  },
  data () {
    return {
      cotas: 'Pagamento em Cotas',
      adiantamento: 'Pagamento Adiantado',
      acumulado: 'Pagamento Acumulado no Final do Trimestre',
      deletar: {
        mostra: false,
        mensagem: null,
        movimentoId: null,
        servicoId: null
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
      semServicos: true,
      servicos: {},
      notasServico: {},
      notas: {},
      trimestre: {},
      tipoTabela: null,
      mostraTudo: false,
      usuario: {}
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
      this.$data.usuario = usuario
    })
  },
  methods: {
    R$: R$,
    retornarTipo: retornarTipo,
    escolherDeletar () {
      if (this.$data.deletar.movimentoId) {
        this.deletarMovimento()
        this.$data.deletar.movimentoId = null
      } else if (this.$data.deletar.servicoId) {
        this.deletarServico()
        this.$data.deletar.servicoId = null
      }
    },
    deletarServico () {
      let servicoId = this.$data.deletar.servicoId
      if (this.$data.servicos[servicoId].dominio === this.$data.usuario.dominio || this.$data.servicos[servicoId].dominio === undefined || this.$data.usuario.dominio === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
        delete this.$data.servicos[servicoId]
        if (_.isEmpty(this.$data.servicos)) {
          this.$data.servicos = {}
        }
        excluirServico(this.$data.empresaSelecionada.pessoa.cnpj, servicoId, err => {
          if (err) console.error(err)
        })
      } else {
        this.chamarMensagem(new Error('Esse serviço não pertence ao seu domínio, você não pode excluí-lo!'))
      }
    },
    definirDeletarServico (id, num) {
      this.$data.deletar.mensagem = `Tem certeza que deseja deletar o servico ${num}?`
      this.$data.deletar.servicoId = id
      this.$data.deletar.mostra = true
    },
    pegaIndexServico (index) {
      let servicos = this.$data.servicos
      return Object.keys(servicos).indexOf(index) + 1
    },
    deletarMovimento () {
      let movimentoId = this.$data.deletar.movimentoId
      if (this.$data.movimentos[movimentoId].dominio === this.$data.usuario.dominio || this.$data.movimentos[movimentoId].dominio === undefined || this.$data.usuario.dominio === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
        delete this.$data.movimentos[movimentoId]
        excluirMovimento(this.$data.empresaSelecionada.pessoa.cnpj, movimentoId, err => {
          if (err) console.error(err)
        })
      } else {
        this.chamarMensagem(new Error('Esse movimento não pertence ao seu domínio, você não pode excluí-lo!'))
      }
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
      this.removerMovimentosEServicos()
      if (this.$data.dominio.empresas[numero]) {
        let cnpj = this.$data.dominio.empresas[numero]
        pegarPessoaId(cnpj, (err, pessoa) => {
          if (err) {
            console.error(err)
          } else {
            pegarEmpresaImpostos(cnpj, (err, impostos) => {
              if (err) {
                console.error(err)
              }
              pessoa.formaPagamento = impostos.formaPagamentoTrimestrais
              pessoa.cnpj = cnpj
              this.$data.empresaSelecionada.pessoa = pessoa
            })
          }
        })
      } else {
        this.$data.empresaSelecionada.pessoa = {}
      }
    },
    selecionarMovimento () {
      cursorCarregando()
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
          pegarServicosMes(pessoaEmpresa.cnpj, competencia, (err, servicos) => {
            if (err) {
              console.error(err)
            }
            if (_.isEmpty(servicos)) {
              this.$data.semServicos = true
              totaisTrimestrais(pessoaEmpresa.cnpj, competencia, (err, trimestre) => {
                if (err) {
                  console.error(err)
                }
                this.$data.trimestre = trimestre
                this.$data.semMovimentos = false
              })
              this.chamarMensagem(new Error(`Não foram encontrados serviços na competência: ${mesEscrito}/${competencia.ano} da empresa Nº${numeroEmpresa} (${pessoaEmpresa.nome})`))
            } else {
              this.$data.servicos = servicos
              Object.keys(servicos).forEach(key => {
                let chave = servicos[key].nota
                pegarNotaServicoChave(chave, (err, notaServico) => {
                  if (err) {
                    console.error(err)
                  } else {
                    this.$data.notasServico = {
                      ...this.$data.notasServico,
                      [chave]: notaServico
                    }
                  }
                })
              })
              totaisTrimestrais(pessoaEmpresa.cnpj, competencia, (err, trimestre) => {
                if (err) {
                  console.error(err)
                }
                cursorNormal()
                this.$data.trimestre = trimestre
                this.$data.semMovimentos = false
                this.$data.semServicos = false
              })
            }
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
      this.$data.mostraTudo = true
      let tabela = this.$refs['tabelas']
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
        .meia-tabela {
          width: 48%;
          float: left;
          margin-right: .5%;
          margin-left: .5%;
        }
        h1 {
          font-size: 10px;
        }
        table {
          color: #333;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 10px;
          width: 100%;
          border-collapse:collapse;
          border-spacing: 0;
        }

        td, th {
          border: 1px solid #333; /* No more visible border */
          height: 8px;
          transition: all 0.3s;  /* Simple transition for hover effect */
        }

        th {
            background: rgb(158, 158, 158);  /* Darken header a bit */
            font-weight: bold;
            font-size: 7px;
        }

        td {
            background: #FAFAFA;
            text-align: center;
            font-size: 7px;
        }

        button {
          border: 0;
          background: none;
          box-shadow: none;
          border-radius: 0px;
          font-weight: normal;
          font-size: 7px;
        }

        /* Cells in even rows (2,4,6...) are one color */
        tr:nth-child(even) td { background: rgb(218, 218, 218); }

        /* Cells in odd rows (1,3,5...) are another (excludes header cells)  */
        tr:nth-child(odd) td { background: #FEFEFE; }`

      this.$nextTick(() => {
        printer.print(tabela, css, win => {
          win.print()
          this.$data.mostraTudo = false
        })
      })
    },
    removerMovimentosEServicos () {
      this.$data.movimentos = {}
      this.$data.semMovimentos = true
      this.$data.servicos = {}
      this.$data.semServicos = true
      this.$data.trimestre = {}
    },
    pegarMes (num) {
      let meses = this.$data.meses
      let mes
      Object.keys(meses).forEach(key => {
        if (meses[key].num === num) {
          mes = meses[key].nome
        }
      })
      return mes
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
      return !this.$data.semMovimentos && !_.isEmpty(this.$data.movimentos)
    },
    temServicos () {
      return !this.$data.semServicos && !_.isEmpty(this.$data.servicos)
    },
    temAcumulado () {
      return !_.isEmpty(this.$data.trimestre)
    },
    calcularCotas () {
      let total = this.$data.trimestre.totais

      let valorIr = total.impostos.irpj + total.impostos.adicionalIr - total.impostos.retencoes.irpj
      let valorCsll = total.impostos.csll - total.impostos.retencoes.csll

      let cotaIr = { valor: 0, numero: 0 }
      let cotaCsll = { valor: 0, numero: 0 }

      if (valorIr / 3 > 1000) {
        cotaIr = { valor: valorIr / 3, numero: 3 }
      } else if (valorIr / 2 > 1000) {
        cotaIr = { valor: valorIr / 2, numero: 2 }
      } else {
        cotaIr = { valor: valorIr, numero: 1 }
      }

      if (valorCsll / 3 > 1000) {
        cotaCsll = { valor: valorCsll / 3, numero: 3 }
      } else if (valorCsll / 2 > 1000) {
        cotaCsll = { valor: valorCsll / 2, numero: 2 }
      } else {
        cotaCsll = { valor: valorCsll, numero: 1 }
      }

      return { cotaCsll: cotaCsll, cotaIr: cotaIr }
    },
    ordenarMovimentos () {
      return _.orderBy(this.$data.movimentos, 'data')
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
