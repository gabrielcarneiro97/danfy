<template>
  <div>
    <div class="md-layout md-alignment-top-center" id="tabela">
      <md-table class="md-layout-item md-size-90" v-if="mostraMovimentos">
        <md-table-toolbar>
          <h1 class="md-title">Conciliar Notas</h1>
          <md-button @click="enviarMovimentos" :disabled="!movimentosAEnviar">ENVIAR MOVIMENTOS</md-button>
        </md-table-toolbar>
        <md-table-row>
          <md-table-head>Número</md-table-head>       
          <md-table-head>Nota Inicial</md-table-head>         
          <md-table-head>Nota Final</md-table-head>
          <md-table-head>Base Impostos</md-table-head>
          <md-table-head>Tipo de Operação</md-table-head>
          <md-table-head>Confirmar Movimento</md-table-head>
        </md-table-row>

        <md-table-row v-for="(movimento, index) in ordenarMovimentos" v-bind:key="index + 'movimentos'">

          <md-table-cell md-numeric>{{index+1}}</md-table-cell>

          <md-table-cell>
            <div v-if="movimento.notaInicial" class="md-layout md-alignment-center-center">
              <nota-dialogo :chave="movimento.notaInicial" class="md-layout-item">{{isNaN(parseInt(notas[movimento.notaInicial].geral.numero)) ? notas[movimento.notaInicial].geral.numero : parseInt(notas[movimento.notaInicial].geral.numero)}}</nota-dialogo>
              <md-button class="md-icon-button md-list-action md-primary md-layout-item" @click="confirmaRemoverInicial(movimentos.indexOf(movimento))">
                <font-awesome-icon :icon="faTrash" size="lg" />
              </md-button>
            </div>
            <md-button v-else @click="abrirAdicionarNota(movimentos.indexOf(movimento))">ADICIONAR INICIAL</md-button>
          </md-table-cell>

          <md-table-cell>
            <nota-dialogo :chave="movimento.notaFinal">{{parseInt(notas[movimento.notaFinal].geral.numero)}}</nota-dialogo>
          </md-table-cell>
          <md-table-cell>
            <span v-if="movimento.valores">
              {{R$(movimento.valores.lucro)}}
            </span>
            <span v-else>
              0,00
            </span>
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
            <md-checkbox v-model="movimento.conferido" class="md-primary"></md-checkbox>
          </md-table-cell>
        </md-table-row>
      </md-table>
      <md-divider></md-divider>

      <md-table class="md-layout-item md-size-90" v-if="mostraServicos">
        <md-table-toolbar>
          <h1 class="md-title">Conciliar Servicos</h1>
          <md-button @click="enviarServicos" :disabled="!servicosAEnviar">ENVIAR SERVIÇOS</md-button>
        </md-table-toolbar>
        <md-table-row>
          <md-table-head>Número</md-table-head>
          <md-table-head>Nota</md-table-head>
          <md-table-head>Status</md-table-head>          
          <md-table-head>Valor do Serviço</md-table-head>          
          <md-table-head md-numeric>Confirmar Serviço</md-table-head>
        </md-table-row>

        <md-table-row v-for="servico in servicos" v-bind:key="servicos.indexOf(servico) + 'servico'">

          <md-table-cell>{{servicos.indexOf(servico)+1}}</md-table-cell>

          <md-table-cell>{{notasServico[servico.nota].geral.numero}}</md-table-cell>
          <md-table-cell>{{notasServico[servico.nota].geral.status}}</md-table-cell>                  
          <md-table-cell>{{R$(notasServico[servico.nota].valor.servico)}}</md-table-cell>
          <md-table-cell md-numeric>
            <md-checkbox v-model="servico.conferido" class="md-primary"></md-checkbox>
          </md-table-cell>
        </md-table-row>
      </md-table>

    </div>

    <md-dialog :md-active.sync="mostraAdicionarNota">
      <md-dialog-content>
        <md-toolbar :md-elevation="1">
          <span class="md-title">ADICIONAR NOTA AO MOVIMENTO</span>
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
          <md-list-item md-expand>
            <span class="md-list-item-text">Adicionar Valor da Nota Inicial</span>
            <md-list slot="md-expand">
              <md-list-item>
                <md-field md-clearable>
                  <label>Valor</label>
                  <md-input v-model="valorDaNota"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item>
                <md-button @click="adicionarValor">Adicionar</md-button>
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

    <md-dialog :md-active.sync="remover.mostra">
      <md-dialog-title>Tem certeza?</md-dialog-title>
      <md-dialog-content>
        {{remover.mensagem}}
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="remover.mostra = false">CANCELA</md-button>        
        <md-button class="md-primary" @click="removerInicial">CONFIRMA</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />
  </div>
</template>

<script>
import { R$, calcularImpostosMovimento, calcularImpostosServico, pegarDominio,
  usuarioAtivo, pegarNotaChave, procurarNotaPar, estaNoDominio, validarMovimento,
  pegarNotaNumeroEmitente, lerNotasInput, gravarMovimentos, gravarServicos, gravarNotaSlim } from './services'
import notaDialogo from './notaDialogo'
import _ from 'lodash'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faTrash } from '@fortawesome/fontawesome-free-solid'

export default {
  components: {
    notaDialogo,
    FontAwesomeIcon
  },
  data () {
    return {
      usuario: {},
      valorDaNota: null,
      mostraAdicionarNota: false,
      remover: {
        mostra: false,
        mensagem: ''
      },
      mostraFinal: false,
      relatorioFinal: null,
      notaParaAdicionarXml: null,
      switchEmitente: true,
      adicionarNumeroEmitenteInfo: {
        emitente: null,
        numeroNota: null
      },
      chaveParaAdicionar: null,
      movimentos: [],
      servicos: [],
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
        this.$data.usuario = usuario
        pegarDominio((err, dominio) => {
          if (err) console.error(err)

          Object.keys(this.$store.state.notas).forEach((id, index, arr) => {
            let nota = this.$store.state.notas[id]
            if ((nota.geral.tipo === '1' || nota.geral.cfop === '1113' || nota.geral.cfop === '1202' || nota.geral.cfop === '2202') && estaNoDominio(nota.emitente) && nota.geral.status !== 'CANCELADA') {
              let movimento = {
                notaFinal: id,
                notaInicial: null,
                data: nota.geral.dataHora,
                conferido: false,
                dominio: this.$data.usuario.dominio,
                metaDados: {
                  criadoPor: this.$store.state.usuario.email,
                  dataCriacao: new Date().toISOString(),
                  status: 'ATIVO',
                  tipo: 'PRIM',
                  movimentoRef: ''
                }
              }
              procurarNotaPar(nota, (err, movimentoRet) => {
                if (err) {
                  console.error(err)
                } else if (!_.isEmpty(movimentoRet)) {
                  calcularImpostosMovimento(movimentoRet.notaInicial, movimentoRet.notaFinal, (err, valores) => {
                    if (err) {
                      console.error(err)
                    } else {
                      movimento.conferido = true
                      movimento.notaFinal = movimentoRet.notaFinal.chave
                      movimento.notaInicial = movimentoRet.notaInicial.chave
                      movimento.valores = valores
                      this.$data.movimentos.push(movimento)
                    }
                  })
                } else {
                  calcularImpostosMovimento(null, nota, (err, valores) => {
                    if (err) {
                      console.error(err)
                    } else {
                      movimento.valores = valores
                      this.$data.movimentos.push(movimento)
                    }
                  })
                }
              })
            }
          })

          Object.keys(this.$store.state.notasServico).forEach(id => {
            let notaServico = this.$store.state.notasServico[id]
            if (estaNoDominio(notaServico.emitente)) {
              calcularImpostosServico(notaServico, (err, valores) => {
                if (err) {
                  console.error(err)
                } else {
                  let servico = {
                    conferido: true,
                    nota: notaServico.chave,
                    data: notaServico.geral.dataHora,
                    valores: valores,
                    dominio: this.$data.usuario.dominio,
                    metaDados: {
                      criadoPor: this.$store.state.usuario.email,
                      dataCriacao: new Date().toISOString()
                    }
                  }
                  this.$data.servicos.push(servico)
                }
              })
            }
          })
        })
      }
    })
  },
  methods: {
    R$: R$,
    proximo () {
      if (!this.mostraServicos && !this.mostraMovimentos) {
        this.$router.push('/mostrarMovimentos')
      } else {
        this.$data.mostraFinal = false
      }
    },
    enviarServicos () {
      let servicos = this.$data.servicos
      let paraGravar = {}
      let notasServico = this.$store.state.notasServico
      let contador = 0

      servicos.forEach(servico => {
        if (servico.conferido) {
          let empresa = notasServico[servico.nota].emitente

          if (!paraGravar[empresa]) {
            paraGravar[empresa] = []
          }

          paraGravar[empresa].push(servico)
          contador++
        }
      })

      gravarServicos(paraGravar, err => {
        if (err) {
          console.error(err)
        }
        this.$data.servicos = []
        this.$data.mostraFinal = true
        this.$data.relatorioFinal = `${contador} serviços gravados com sucesso!`
      })
    },
    enviarMovimentos () {
      let movimentos = this.$data.movimentos
      let paraGravar = {}
      let notas = this.$store.state.notas
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
        this.$data.movimentos = []
        this.$data.mostraFinal = true
        this.$data.relatorioFinal = `${contador} movimentos gravados com sucesso!`
      })
    },
    abrirAdicionarNota (id) {
      this.$data.mostraAdicionarNota = true
      this.adicionarPorNumeroEmitente = () => {
        let emitente
        let num = this.$data.adicionarNumeroEmitenteInfo.numeroNota
        let notas = this.$store.state.notas
        let movimentoId = id
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
                calcularImpostosMovimento(notaInicial, notaFinal, (err, valores) => {
                  if (err) {
                    this.chamarMensagem(err)
                  } else {
                    this.$data.movimentos[movimentoId].notaInicial = notaInicial.chave
                    this.$data.movimentos[movimentoId].valores = valores
                    this.$data.mostraAdicionarNota = false
                    this.$data.adicionarNumeroEmitenteInfo.numeroNota = null
                    this.$data.adicionarNumeroEmitenteInfo.emitente = null
                    this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
                  }
                })
              }
            })
          } else {
            this.chamarMensagem(new Error('Nota não localizada!'))
          }
        })
      }
      this.adicionarPorXml = (e) => {
        if (e.target.files) {
          let movimentoId = id
          let notas = this.$store.state.notas
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
      }
      this.adicionarPorChave = () => {
        if (!this.$data.chaveParaAdicionar) {
          return false
        }

        let chave = this.$data.chaveParaAdicionar.toString()
        let notas = this.$store.state.notas
        let movimentoId = id
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
      this.adicionarValor = () => {
        let notas = this.$store.state.notas
        let movimentoId = id
        let notaFinal = notas[this.$data.movimentos[movimentoId].notaFinal]
        let valor = parseFloat(this.$data.valorDaNota.toString().replace(',', '.'))
        let notaInicial = {
          emitente: 'INTERNO',
          destinatario: notaFinal.emitente,
          geral: {
            dataHora: new Date().toISOString(),
            cfop: 'INTERNO',
            naturezaOperacao: 'INTERNO',
            numero: 'INTERNO',
            status: 'INTERNO',
            tipo: 'INTERNO'
          },
          produtos: {
            INTERNO: {
              descricao: 'INTERNO',
              quantidade: {
                numero: '1',
                tipo: 'UN'
              },
              valor: {
                total: valor
              }
            }
          },
          valor: {
            total: valor
          }
        }

        gravarNotaSlim(notaInicial, (err, notaInicialCompleta) => {
          if (err) {
            console.error(err)
          }
          notaInicial = notaInicialCompleta
          calcularImpostosMovimento(notaInicial, notaFinal, (err, valores) => {
            if (err) {
              console.error(err)
            } else {
              this.$data.movimentos[movimentoId].notaInicial = notaInicial.chave
              this.$data.movimentos[movimentoId].valores = valores
              this.$data.mostraAdicionarNota = false
              this.chamarMensagem(new Error('Nota Adicionada com sucesso!'))
              this.$data.valorDaNota = null
            }
          })
        })
      }
    },
    adicionarPorXml (e) {},
    adicionarPorNumeroEmitente () {},
    adicionarPorChave () {},
    adicionarValor () {},
    confirmaRemoverInicial (id) {
      this.$data.remover.mostra = true
      this.$data.remover.mensagem = `Você tem certeza que deseja remover a nota inicial do movimento ${id + 1}?`

      this.removerInicial = () => {
        this.$data.movimentos[id].notaInicial = null
        calcularImpostosMovimento(null, this.$store.state.notas[this.$data.movimentos[id].notaFinal], (err, valores) => {
          if (err) {
            console.error(err)
          } else {
            this.$data.movimentos[id].valores = valores
            this.$data.movimentos[id].conferido = false
          }
        })
        this.$data.remover.mostra = false
      }
    },
    removerInicial () {},
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    }
  },
  watch: {
    movimentos (movimentos) {
      if (!_.isEmpty(movimentos)) {
        movimentos.forEach(movimento => {
          let notaFinal = this.$store.state.notas[movimento.notaFinal]
          let notaInicial = this.$store.state.notas[movimento.notaInicial]

          if ((notaFinal.geral.cfop === '1202' || notaFinal.geral.cfop === '2202') && (movimento.valores.lucro >= 0)) {
            movimentos.forEach(movimento2 => {
              if (movimento.notaInicial === movimento2.notaFinal) {
                notaInicial.valor.total = parseFloat(movimento2.valores.lucro) + parseFloat(notaInicial.valor.total)
                calcularImpostosMovimento(notaInicial, notaFinal, (err, valores) => {
                  if (err) {
                    console.error(err)
                  } else {
                    movimento.valores = valores
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
    faTrash: _ => faTrash,
    notas () {
      return this.$store.state.notas
    },
    notasServico () {
      return this.$store.state.notasServico
    },
    movimentosAEnviar () {
      let movimentos = this.$data.movimentos

      for (let id in movimentos) {
        let movimento = movimentos[id]
        if (movimento.conferido) {
          return true
        }
      }
      return false
    },
    servicosAEnviar () {
      let servicos = this.$data.servicos

      for (let id in servicos) {
        let servico = servicos[id]
        if (servico.conferido) {
          return true
        }
      }
      return false
    },
    mostraMovimentos () {
      if (this.$data.movimentos.length === 0) {
        return false
      } else if (this.$data.movimentosEnviados) {
        return false
      } else {
        return true
      }
    },
    mostraServicos () {
      if (this.$data.servicos.length === 0) {
        return false
      } else if (this.$data.servicosEnviados) {
        return false
      } else {
        return true
      }
    },
    ordenarMovimentos () {
      return _.orderBy(this.$data.movimentos, 'notaFinal')
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
