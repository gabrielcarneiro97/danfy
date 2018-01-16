<template>
  <div>
    <div class="md-layout md-alignment-top-center">
      <md-table class="md-layout-item md-size-90">
        <md-table-row>
          <md-table-head md-numeric>Número</md-table-head>
          <md-table-head>Nota Entrada</md-table-head>
          <md-table-head>Nota Saída</md-table-head>
        </md-table-row>

        <md-table-row v-for="movimento in movimentos" v-bind:key="movimentos.indexOf(movimento)">

          <md-table-cell md-numeric>{{movimentos.indexOf(movimento)+1}}</md-table-cell>

          <md-table-cell>
            <md-button v-if="movimento.notaInicial" @click="abrirNota(movimento.notaInicial)">{{movimento.notaInicial}}</md-button>
            <md-button v-else @click="abrirAdicionarNota(movimentos.indexOf(movimento))">ADICIONAR ENTRADA</md-button>
          </md-table-cell>
          <md-table-cell><md-button @click="abrirNota(movimento.notaFinal)">{{movimento.notaFinal}}</md-button></md-table-cell>
        </md-table-row>
      </md-table>
    </div>
    <md-dialog v-if="notaDialogo" :md-active.sync="mostra">
      <md-dialog-content>
        <div class="viewport">
          <md-toolbar :md-elevation="1">
            <span class="md-title">{{notaDialogo.id}}</span>
          </md-toolbar>
          <md-list>
            <md-list-item>
              <h4>Número</h4>
              <span>{{notaDialogo.geral.numero}}</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Data e Hora</h4>
              <span>{{notaDialogo.geral.dataHora}}</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Tipo</h4>
              <span v-if="notaDialogo.geral.tipo === '1'">SAÍDA</span>
              <span v-else-if="notaDialogo.geral.tipo === '0'">ENTRADA</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Valor Total</h4>
              <span>R$ {{notaDialogo.valor.total}}</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Natureza Operação</h4>
              <span>{{notaDialogo.geral.naturezaOperacao}}</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Emitente</h4>
              <span v-if="pessoas[notaDialogo.emitente]">{{pessoas[notaDialogo.emitente].nome}}</span>
              <span>{{notaDialogo.emitente}}</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Destinatário</h4>
              <span v-if="pessoas[notaDialogo.destinatario]">{{pessoas[notaDialogo.destinatario].nome}}</span>
              <span>{{notaDialogo.destinatario}}</span>
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item>
              <h4>Informações Complementares</h4>
            </md-list-item>
            <md-list-item class="md-triple-line">
              <span class="md-list-item-text">{{notaDialogo.complementar.textoComplementar}}</span>
            </md-list-item>
            <md-divider></md-divider>
          </md-list>
        </div>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="mostra = false">FECHAR</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog :md-active.sync="mostraAdicionarNota">
      <md-dialog-content>
        <md-toolbar :md-elevation="1">
          <span class="md-title">ADICIONAR NOTA AO MOVIMENTO {{movimentoParaAdicionarId+1}}</span>
        </md-toolbar>
        <md-list>
          <md-list-item md-expand>
            <span class="md-list-item-text">Adicionar por chave</span>
            <md-list slot="md-expand">
              <md-list-item>
                <md-field md-clearable>
                  <label>CHAVE</label>
                  <md-input v-model="chaveParaAdicionar"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item>
                <md-button @click="adicionarPorChave">Adicionar</md-button>
              </md-list-item>
            </md-list>
          </md-list-item>
          <md-list-item md-expand>
            <span class="md-list-item-text">Adicionar por Número + Emitente</span>
            <md-list slot="md-expand">
              <md-list-item>
                <md-switch v-model="switchEmitente">Mesmo Emitente</md-switch>
              </md-list-item>
              <md-list-item>
                <md-field md-clearable>
                  <label>CNPJ</label>
                  <md-input :disabled="switchEmitente" v-model="adicionarNumeroEmitenteInfo.emitente"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item>
                <md-field md-clearable>
                  <label>NÚMERO DA NOTA</label>
                  <md-input v-model="adicionarNumeroEmitenteInfo.numero"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item>
                <md-button @click="adicionarPorNumeroEmitente">Adicionar</md-button>
              </md-list-item>
            </md-list>
          </md-list-item>
        </md-list>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="mostraAdicionarNota = false">FECHAR</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />
  </div>
</template>

<script>
import { pegarDominio, usuarioAtivo, pegarNotaChave, estaNoDominio, validarMovimento, pegarNotaNumeroEmitente } from './services/firebase.service'
import store from '../store'

export default {
  data () {
    return {
      mostra: false,
      mostraAdicionarNota: false,
      movimentoParaAdicionarId: null,
      notaDialogo: null,
      switchEmitente: true,
      adicionarNumeroEmitenteInfo: {
        emitente: null,
        numeroNota: null
      },
      chaveParaAdicionar: null,
      notas: {},
      pessoas: {},
      movimentos: [],
      erro: {
        mensagem: '',
        mostra: false
      }
    }
  },
  created () {
    usuarioAtivo(ativo => {
      if (!ativo) this.$router.push('/login')
      else {
        pegarDominio((err, dominio) => {
          if (err) console.error(err)

          this.$data.notas = store.getState().notas
          this.$data.pessoas = store.getState().pessoas

          Object.keys(this.$data.notas).forEach(id => {
            let nota = this.$data.notas[id]
            if ((nota.geral.tipo === '1' || nota.geral.cfop === '1113') && estaNoDominio(nota.emitente)) {
              let movimento = {
                notaFinal: id,
                notaInicial: nota.complementar ? nota.complementar.notaReferencia : null,
                data: new Date(nota.geral.dataHora)
              }
              this.$data.movimentos.push(movimento)
            }
          })
        })
      }
    })
  },
  methods: {
    abrirNota (notaId) {
      let nota = this.$data.notas[notaId]
      if (nota) {
        this.$data.notaDialogo = {
          ...nota,
          id: notaId
        }
        this.$data.mostra = true
      } else {
        pegarNotaChave(notaId, (err, nota) => {
          if (err) {
            console.error(err)
          }
          if (!nota) {
            this.chamarMensagem(new Error('Nota não localizada!'))
          }
        })
      }
    },
    abrirAdicionarNota (id) {
      this.$data.mostraAdicionarNota = true
      this.$data.movimentoParaAdicionarId = id
    },
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    },
    adicionarPorNumeroEmitente () {
      let emitente
      let num = this.$data.adicionarNumeroEmitenteInfo.num
      if (this.$data.switchEmitente) {
        emitente = this.$data.notas[this.$data.movimentos[this.$data.movimentoParaAdicionarId].notaFinal].emitente
      } else {
        emitente = this.$data.adicionarNumeroEmitenteInfo.emitente
      }
      pegarNotaNumeroEmitente(num, emitente, (err, nota) => {
        if (err) console.error(err)
        console.log(nota)
      })
    },
    adicionarPorChave () {
      if (!this.$data.chaveParaAdicionar) {
        return false
      }

      let chave = this.$data.chaveParaAdicionar.toString()
      let notas = this.$data.notas
      let movimentoId = this.$data.movimentoParaAdicionarId
      let notaFinal = notas[this.$data.movimentos[movimentoId].notaFinal]
      let notaInicial

      if (chave.length === 44) {
        pegarNotaChave(chave, (err, nota) => {
          if (err) {
            console.error(err)
          }
          if (!nota) {
            this.chamarMensagem(new Error('Nota não localizada!'))
          } else {
            notaInicial = nota
            validarMovimento(notaInicial, notaFinal, err => {
              if (err) {
                this.chamarMensagem(err)
              } else {
                this.$data.movimentos[movimentoId].notaInicial = chave
                this.$data.notas = store.getState().notas
                this.$data.mostraAdicionarNota = false
                this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
              }
            })
          }
        })
      }
    }
  },
  computed: {

  }
}
</script>

<style lang="scss" scoped>

</style>
