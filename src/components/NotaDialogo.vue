<template>
  <span>
    <md-button @click="abrirNota" :disabled="interno"><slot>NOTA</slot></md-button>

    <md-dialog v-if="notaDialogo && !interno" :md-active.sync="mostra">
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
              <h4>Data</h4>
              <span>{{new Date(notaDialogo.geral.dataHora).toLocaleDateString()}}</span>
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
              <h4>Produtos</h4>
            </md-list-item>
            <md-list-item v-for="(produto, id) in notaDialogo.produtos" v-bind:key="id">
              <md-list-item class="md-list-item-text">{{id}}: {{produto.descricao}}</md-list-item>
              <md-list-item class="md-list-item-text">VALOR: {{produto.valor.total}}</md-list-item>
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
              <span class="md-list-item-text"><small v-if="notaDialogo.complementar">{{notaDialogo.complementar.textoComplementar}}</small></span>
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
      <md-dialog-title>Nota não encontrada! Selecione o XML para importa-la.</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>Nota</label>
          <md-file @change="adicionarXml" accept=".xml" />
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="mostraAdicionarNota = false">FECHAR</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />
  </span>
</template>

<script>
import { pegarNotaChave, pegarPessoaId, lerNotasInput } from './services'

export default {
  name: 'nota-dialogo',
  props: ['chave'],
  data () {
    return {
      interno: false,
      notaDialogo: null,
      pessoas: {},
      mostra: false,
      mostraAdicionarNota: false,
      erro: {
        mensagem: '',
        mostra: false
      }
    }
  },
  created () {
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
                  this.$data.pessoas = {
                    [nota.emitente]: emit,
                    [nota.destinatario]: dest
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  methods: {
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

          console.log(nota)

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
      if (this.$data.notaDialogo) {
        this.$data.mostra = true
      } else {
        this.$data.mostraAdicionarNota = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
