<template>
  <div>
    <div class="md-layout md-alignment-top-center" id="tabela">
      <md-table class="md-layout-item md-size-90">
        <md-table-toolbar>
          <h1 class="md-title">Conciliar Notas</h1>
          <md-button @click="enviarMovimentos" :disabled="!movimentosAEnviar">ENVIAR MOVIMENTOS</md-button>
        </md-table-toolbar>
        <md-table-row>
          <md-table-head>Número</md-table-head>
          <md-table-head>Nota Inicial</md-table-head>
          <md-table-head>Nota Final</md-table-head>
          <md-table-head>Tipo de Operação</md-table-head>
          <md-table-head>Confirmar Movimento</md-table-head>
        </md-table-row>

        <md-table-row v-for="movimento in movimentos" v-bind:key="movimentos.indexOf(movimento)">

          <md-table-cell md-numeric>{{movimentos.indexOf(movimento)+1}}</md-table-cell>

          <md-table-cell>
            <nota-dialogo v-if="movimento.notaInicial" :chave="movimento.notaInicial">{{notas[movimento.notaInicial].geral.numero}}</nota-dialogo>
            <md-button v-else @click="abrirAdicionarNota(movimentos.indexOf(movimento))">ADICIONAR INICIAL</md-button>
          </md-table-cell>
          <md-table-cell>
            <nota-dialogo :chave="movimento.notaFinal">{{notas[movimento.notaFinal].geral.numero}}</nota-dialogo>
          </md-table-cell>
          <md-table-cell>
            <div v-if="notas[movimento.notaFinal].informacoesEstaduais.estadoDestino === notas[movimento.notaFinal].informacoesEstaduais.estadoGerador">
              OPERAÇÃO INTERNA
            </div>
            <div v-else>
              OPERAÇÃO INTERESTADUAL {{notas[movimento.notaFinal].informacoesEstaduais.estadoGerador}} -> {{notas[movimento.notaFinal].informacoesEstaduais.estadoDestino}} COM<span v-if="notas[movimento.notaFinal].informacoesEstaduais.destinatarioContribuinte !== '1'"> NÃO</span> CONTRIBUINTE
            </div>
          </md-table-cell>
          <md-table-cell  md-numeric>
            <md-checkbox v-model="movimento.conferido"></md-checkbox>
          </md-table-cell>
        </md-table-row>
      </md-table>
    </div>
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
import { calcularImpostosMovimento, pegarDominio, usuarioAtivo, pegarNotaChave, procurarNotaPar, estaNoDominio, validarMovimento, pegarNotaNumeroEmitente, lerNotasInput, gravarMovimentos } from './services/firebase.service'
import notaDialogo from './notaDialogo'
import store from '../store'

export default {
  components: { notaDialogo },
  data () {
    return {
      usuario: {},
      mostraAdicionarNota: false,
      mostraFinal: false,
      relatorioFinal: null,
      movimentoParaAdicionarId: null,
      notaParaAdicionarXml: null,
      switchEmitente: true,
      adicionarNumeroEmitenteInfo: {
        emitente: null,
        numeroNota: null
      },
      chaveParaAdicionar: null,
      notas: {},
      movimentos: [],
      erro: {
        mensagem: '',
        mostra: false
      }
    }
  },
  created () {
    usuarioAtivo((ativo, usuario, tipoDominio) => {
      if (!ativo) {
        this.$router.push('/login')
      } else if (tipoDominio !== 'mult') {
        this.$router.push('/mostrarMovimentos')
      } else {
        this.$data.usuario = ativo
        pegarDominio((err, dominio) => {
          if (err) console.error(err)

          this.$data.notas = store.getState().notas

          Object.keys(this.$data.notas).forEach(id => {
            let nota = this.$data.notas[id]
            if ((nota.geral.tipo === '1' || nota.geral.cfop === '1113' || nota.geral.cfop === '1202' || nota.geral.cfop === '2202') && estaNoDominio(nota.emitente)) {
              let movimento = {
                notaFinal: id,
                notaInicial: null,
                data: nota.geral.dataHora,
                conferido: false
              }
              procurarNotaPar(nota, (err, notaRetorno) => {
                if (err) {
                  console.error(err)
                } else if (notaRetorno) {
                  validarMovimento(notaRetorno, nota, err => {
                    console.log(nota)
                    console.log(notaRetorno)
                    if (!err) {
                      movimento.notaInicial = notaRetorno.chave
                      movimento.valores = calcularImpostosMovimento(notaRetorno, nota, (err, valores) => {
                        if (err) {
                          console.error(err)
                        } else {
                          movimento.valores = valores
                          this.$data.movimentos.push(movimento)
                        }
                      })
                    }
                    this.$data.notas = {
                      ...this.$data.notas,
                      [notaRetorno.chave]: notaRetorno
                    }
                  })
                }
              })
            }
          })
        })
      }
    })
  },
  methods: {
    proximo () {
      this.$router.push('/mostrarMovimentos')
    },
    enviarMovimentos () {
      let movimentos = this.$data.movimentos
      let paraGravar = {}
      let notas = this.$data.notas
      let contador = 0

      movimentos.forEach(movimento => {
        if (movimento.conferido) {
          let empresa = notas[movimento.notaFinal].emitente

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
    abrirAdicionarNota (id) {
      this.$data.mostraAdicionarNota = true
      this.$data.movimentoParaAdicionarId = id
    },
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    },
    adicionarPorXml (e) {
      if (e.target.files) {
        let movimentoId = this.$data.movimentoParaAdicionarId
        let notas = this.$data.notas
        let notaFinal = notas[this.$data.movimentos[movimentoId].notaFinal]

        lerNotasInput(e.target.files, (notaBruto) => {
          let notaInicial
          Object.keys(notaBruto).forEach(key => {
            notaInicial = notaBruto[key]
          })

          notas = {
            ...notas,
            ...notaBruto
          }
          validarMovimento(notaInicial, notaFinal, err => {
            if (err) {
              this.chamarMensagem(err)
            } else {
              calcularImpostosMovimento(notaInicial, notaFinal, (err, valores) => {
                if (err) {
                  console.error(err)
                } else {
                  this.$data.movimentos[movimentoId].notaInicial = notaInicial.chave
                  this.$data.movimentos[movimentoId].valores = valores
                  this.$data.notas = store.getState().notas
                  this.$data.mostraAdicionarNota = false
                  this.$data.adicionarNumeroEmitenteInfo.numeroNota = null
                  this.$data.adicionarNumeroEmitenteInfo.emitente = null
                  this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
                }
              })
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
              calcularImpostosMovimento(notaInicial, notaFinal, valores => {
                this.$data.movimentos[movimentoId].notaInicial = notaInicial.chave
                this.$data.movimentos[movimentoId].valores = valores
                this.$data.notas = store.getState().notas
                this.$data.mostraAdicionarNota = false
                this.$data.adicionarNumeroEmitenteInfo.numeroNota = null
                this.$data.adicionarNumeroEmitenteInfo.emitente = null
                this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
              })
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
                calcularImpostosMovimento(notaInicial, notaFinal, (err, valores) => {
                  if (err) {
                    console.error(err)
                  } else {
                    this.$data.movimentos[movimentoId].notaInicial = chave
                    this.$data.movimentos[movimentoId].valores = valores
                    this.$data.notas = store.getState().notas
                    this.$data.mostraAdicionarNota = false
                    this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
                  }
                })
              }
            })
          }
        })
      }
    }
  },
  computed: {
    movimentosAEnviar () {
      let movimentos = this.$data.movimentos

      for (let id in movimentos) {
        let movimento = movimentos[id]
        if (movimento.conferido) {
          return true
        }
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
#tabela {
  margin-top: 2%;
  margin-bottom: 2%;
}
</style>
