<template>
  <div>
    <md-button @click="abrirNota"><slot>NOTA</slot></md-button>

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
              <h4>Produtos</h4>
            </md-list-item>
            <md-list-item v-for="(produto, id) in notaDialogo.produtos" v-bind:key="id">
              <md-list-item class="md-list-item-text">{{id}}: {{produto.descricao}}</md-list-item>
              <md-list-item class="md-list-item-text">VALOR: {{produto.valor.total}}</md-list-item>
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
  </div>
</template>

<script>
import { pegarNotaChave, pegarPessoaId } from './services/firebase.service'

export default {
  name: 'nota-dialogo',
  props: ['chave'],
  data () {
    return {
      notaDialogo: null,
      pessoas: {},
      mostra: false
    }
  },
  created () {
    let chave = this.$props.chave
    pegarNotaChave(chave, (err, nota) => {
      console.log(chave)
      if (err) {
        console.error(err)
      } else {
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
    })
  },
  methods: {
    abrirNota () {
      this.$data.mostra = true
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
