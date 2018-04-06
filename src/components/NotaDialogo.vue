<template>
  <span>
    <v-btn depressed @click="abrirNota" :disabled="interno"><slot>NOTA</slot></v-btn>

    <v-dialog v-if="notaDialogo && !interno" v-model="mostra" max-width="80vw">
      <v-card>
        <v-card-text>
          <v-list three-line>
              <v-subheader>{{notaDialogo.id}}</v-subheader>
              <v-divider></v-divider>              
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Número</v-list-tile-title>
                  <v-list-tile-sub-title>{{notaDialogo.geral.numero}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>              
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Data</v-list-tile-title>
                  <v-list-tile-sub-title>{{new Date(notaDialogo.geral.dataHora).toLocaleDateString()}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>              
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Tipo</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span v-if="notaDialogo.geral.tipo === '1'">SAÍDA</span>
                    <span v-else-if="notaDialogo.geral.tipo === '0'">ENTRADA</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Valor Total</v-list-tile-title>
                  <v-list-tile-sub-title>{{R$(notaDialogo.valor.total)}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Natureza Operação</v-list-tile-title>
                  <v-list-tile-sub-title>{{notaDialogo.geral.naturezaOperacao}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
              <v-subheader>Produtos</v-subheader>
              <v-list-tile v-for="(produto, id) in notaDialogo.produtos" v-bind:key="id">
                <v-list-tile-content>
                  <v-list-tile-title>{{id}} - R${{R$(produto.valor.total)}}</v-list-tile-title>
                  <v-list-tile-sub-title>{{produto.descricao}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Emitente</v-list-tile-title>
                  <v-list-tile-sub-title v-if="pessoas[notaDialogo.emitente]">{{pessoas[notaDialogo.emitente].nome}} {{notaDialogo.emitente}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Destinatário</v-list-tile-title>
                  <v-list-tile-sub-title v-if="pessoas[notaDialogo.destinatario]">{{pessoas[notaDialogo.destinatario].nome}} {{notaDialogo.destinatario}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Informações Complementares</v-list-tile-title>
                  <v-list-tile-sub-title v-if="notaDialogo.complementar">{{notaDialogo.complementar.textoComplementar}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click.stop="mostra = false">FECHAR</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <erro :mensagem="erro.mensagem" :sync="erro.mostra" @fechar-erro="erro.mostra = false" />
  </span>
</template>

<script>
import { pegarNotaChave, pegarPessoaId, lerNotasInput, R$ } from './services'
import Erro from './Erro'

export default {
  components: [Erro],
  name: 'nota-dialogo',
  props: ['chave'],
  data () {
    return {
      interno: false,
      notaDialogo: null,
      mostra: false,
      mostraAdicionarNota: false,
      erro: {
        mensagem: '',
        mostra: false
      }
    }
  },
  computed: {
    pessoas () { return this.$store.state.pessoas }
  },
  methods: {
    R$: R$,
    chamarMensagem (mensagem) {
      this.$data.erro.mensagem = mensagem.message
      this.$data.erro.mostra = true
    },
    adicionarXml (e) {
      if (e.target.files) {
        let chave = this.$props.chave

        lerNotasInput(e.target.files, (notaBruto) => {
          let nota
          Object.keys(notaBruto).forEach(key => {
            nota = notaBruto[key]
          })

          this.$data.notaDialogo = {
            ...nota,
            id: chave
          }

          if (nota.chave !== chave) {
            this.$data.mostraAdicionarNota = false
            this.chamarMensagem(new Error('O XML importado não tem a chave de acesso informada!'))
          } else {
            this.$data.mostraAdicionarNota = false
            this.$data.mostra = true
          }
        })
      }
    },
    abrirNota () {
      let chave = this.$props.chave
      pegarNotaChave(chave, (err, nota) => {
        if (err) {
          console.error(err)
        } else if (nota.emitente === 'INTERNO') {
          this.$data.interno = true
        } else {
          if (nota) {
            this.$data.notaDialogo = {
              ...nota,
              id: chave
            }
            pegarPessoaId(nota.emitente, (err, emit) => {
              if (err) {
                console.error(err)
              } else {
                pegarPessoaId(nota.destinatario, (err, dest) => {
                  if (err) {
                    console.error(err)
                  } else {
                    this.$data.mostra = true
                  }
                })
              }
            })
          } else {
            this.$data.mostraAdicionarNota = true
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
