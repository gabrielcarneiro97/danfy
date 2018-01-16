<template>
  <div>
    <div class="md-layout md-alignment-top-center">
      <md-table class="md-layout-item md-size-90">
        <md-table-row>
          <md-table-head>Número</md-table-head>
          <md-table-head>Nota Inicial</md-table-head>
          <md-table-head>Nota Final</md-table-head>
          <md-table-head>Confirmar Movimento</md-table-head>
        </md-table-row>

        <md-table-row v-for="movimento in movimentos" v-bind:key="movimentos.indexOf(movimento)">

          <md-table-cell md-numeric>{{movimentos.indexOf(movimento)+1}}</md-table-cell>

          <md-table-cell>
            <md-button v-if="movimento.notaInicial" @click="abrirNota(movimento.notaInicial)">{{movimento.notaInicial}}</md-button>
            <md-button v-else @click="abrirAdicionarNota(movimentos.indexOf(movimento))">ADICIONAR INICIAL</md-button>
          </md-table-cell>
          <md-table-cell>
            <md-button @click="abrirNota(movimento.notaFinal)">{{movimento.notaFinal}}</md-button>
          </md-table-cell>
          <md-table-cell  md-numeric>
            <md-checkbox v-model="movimento.conferido"></md-checkbox>
          </md-table-cell>
        </md-table-row>
      </md-table>

      <div class="md-layout-item md-size-90">
        <md-button @click="enviarMovimentos">ENVIAR MOVIMENTOS</md-button>
      </div>
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
              <md-list-item v-if="!switchEmitente">
                <md-field md-clearable>
                  <label>CNPJ</label>
                  <md-input v-model="adicionarNumeroEmitenteInfo.emitente"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item>
                <md-field md-clearable>
                  <label>NÚMERO DA NOTA</label>
                  <md-input v-model="adicionarNumeroEmitenteInfo.numeroNota"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item>
                <md-button @click="adicionarPorNumeroEmitente">Adicionar</md-button>
              </md-list-item>
            </md-list>
          </md-list-item>
          <md-list-item md-expand>
            <span class="md-list-item-text">Importar XML</span>
            <md-list slot="md-expand">
              <md-list-item>
                <md-field>
                  <label>Nota</label>
                  <md-file @change="adicionarPorXml" accept=".xml" />
                </md-field>
              </md-list-item>
            </md-list>
          </md-list-item>
        </md-list>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="mostraAdicionarNota = false">FECHAR</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog :md-active.sync="mostraAdicionarNotaConhecida">
      <md-dialog-title>Nota não encontrada! Selecione o XML para importa-la.</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>Nota</label>
          <md-file @change="adicionarXml" accept=".xml" />
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="mostraAdicionarNotaConhecida = false">FECHAR</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog :md-active.sync="mostraFinal">
      <md-dialog-title>Importação concluída</md-dialog-title>
      <md-dialog-content>
        {{relatorioFinal}}
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="proximo">PRÓXIMO</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />
  </div>
</template>

<script>
import { pegarDominio, usuarioAtivo, pegarNotaChave, estaNoDominio, validarMovimento, pegarNotaNumeroEmitente, lerNotasInput, gravarMovimentos } from './services/firebase.service'
import store from '../store'

export default {
  data () {
    return {
      mostra: false,
      usuario: {},
      mostraAdicionarNota: false,
      mostraFinal: false,
      relatorioFinal: null,
      movimentoParaAdicionarId: null,
      notaParaAdicionarXml: null,
      mostraAdicionarNotaConhecida: false,
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
        this.$data.usuario = ativo
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
                data: nota.geral.dataHora,
                conferido: false
              }
              this.$data.movimentos.push(movimento)
            }
          })
        })
      }
    })
  },
  methods: {
    proximo () {
      this.$router.push('/')
    },
    enviarMovimentos () {
      let movimentos = this.$data.movimentos
      let paraGravar = {}
      let notas = this.$data.notas
      let contador = 0

      movimentos.forEach(movimento => {
        if (movimento.conferido) {
          let empresa = notas[movimento.notaFinal].emitente
          let valorInicial = notas[movimento.notaInicial] ? parseFloat(notas[movimento.notaInicial].valor.total) : null
          let valorFinal = parseFloat(notas[movimento.notaFinal].valor.total)

          if (valorInicial) {
            movimento.valor = valorFinal - valorInicial
          } else {
            movimento.valor = -1
          }
          if (!paraGravar[empresa]) {
            paraGravar[empresa] = []
          }

          paraGravar[empresa].push(movimento)
          contador++
        }
      })

      gravarMovimentos(paraGravar, err => {
        if (err) {
          console.error(err)
        }
        this.$data.mostraFinal = true
        this.$data.relatorioFinal = `${contador} movimentos gravados com sucesso!`
      })
    },
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
            this.$data.mostraAdicionarNotaConhecida = true
            this.$data.notaParaAdicionarXml = notaId
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
    adicionarXml (e) {
      if (e.target.files) {
        let chave = this.$data.notaParaAdicionarXml
        let notas = this.$data.notas

        lerNotasInput(e.target.files, (notaBruto, pessoas) => {
          let nota
          Object.keys(notaBruto).forEach(key => {
            nota = notaBruto[key]
          })

          notas = {
            ...notas,
            ...notaBruto
          }
          this.$data.pessoas = {
            ...this.$data.pessoas,
            ...pessoas
          }

          if (nota.chave !== chave) {
            this.$data.mostraAdicionarNotaConhecida = false
            this.chamarMensagem(new Error('O XML importado não tem a chave de acesso informada!'))
          }
        })
      }
    },
    adicionarPorXml (e) {
      if (e.target.files) {
        let movimentoId = this.$data.movimentoParaAdicionarId
        let notas = this.$data.notas
        let notaFinal = notas[this.$data.movimentos[movimentoId].notaFinal]

        lerNotasInput(e.target.files, (notaBruto, pessoas) => {
          let notaInicial
          Object.keys(notaBruto).forEach(key => {
            notaInicial = notaBruto[key]
          })

          notas = {
            ...notas,
            ...notaBruto
          }
          this.$data.pessoas = {
            ...this.$data.pessoas,
            ...pessoas
          }
          validarMovimento(notaInicial, notaFinal, err => {
            if (err) {
              this.chamarMensagem(err)
            } else {
              this.$data.movimentos[movimentoId].notaInicial = notaInicial.chave
              this.$data.notas = store.getState().notas
              this.$data.mostraAdicionarNota = false
              this.$data.adicionarNumeroEmitenteInfo.numeroNota = null
              this.$data.adicionarNumeroEmitenteInfo.emitente = null
              this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
            }
          })
        })
      }
    },
    adicionarPorNumeroEmitente () {
      let emitente
      let num = this.$data.adicionarNumeroEmitenteInfo.numeroNota
      let notas = this.$data.notas
      let movimentoId = this.$data.movimentoParaAdicionarId
      let notaFinal = notas[this.$data.movimentos[movimentoId].notaFinal]

      if (this.$data.switchEmitente) {
        emitente = notaFinal.emitente
      } else {
        emitente = this.$data.adicionarNumeroEmitenteInfo.emitente
      }
      pegarNotaNumeroEmitente(num, emitente, (err, notaInicial) => {
        if (err) console.error(err)

        if (notaInicial) {
          validarMovimento(notaInicial, notaFinal, err => {
            if (err) {
              this.chamarMensagem(err)
            } else {
              this.$data.movimentos[movimentoId].notaInicial = notaInicial.chave
              this.$data.notas = store.getState().notas
              this.$data.mostraAdicionarNota = false
              this.$data.adicionarNumeroEmitenteInfo.numeroNota = null
              this.$data.adicionarNumeroEmitenteInfo.emitente = null
              this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
            }
          })
        } else {
          this.chamarMensagem(new Error('Nota não localizada!'))
        }
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
