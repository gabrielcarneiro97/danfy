<template>
  <span>
    <md-button @click="mostra = true" class="md-icon-button"><font-awesome-icon :icon="faEdit" /></md-button>

    <md-dialog :md-active.sync="mostra">
      <md-dialog-title>{{id}}</md-dialog-title>

      <md-dialog-content class="md-layout">
        <md-field class="md-layout-item md-size-50">
          <label>IRPJ</label>
          <md-input v-model="movimentoNovo.valores.impostos.irpj"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-50">
          <label>CSLL</label>
          <md-input v-model="movimentoNovo.valores.impostos.csll"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-50">
          <label>PIS</label>
          <md-input v-model="movimentoNovo.valores.impostos.pis"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-50">
          <label>COFINS</label>
          <md-input v-model="movimentoNovo.valores.impostos.cofins"></md-input>
        </md-field>
        <md-divider></md-divider>
        <md-field class="md-layout-item md-size-50">
          <label>BASE ICMS</label>
          <md-input v-model="movimentoNovo.valores.impostos.icms.baseDeCalculo"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-50">
          <label>ICMS</label>
          <md-input v-model="movimentoNovo.valores.impostos.icms.proprio"></md-input>
        </md-field>

        <md-field class="md-layout-item md-size-50" v-if="movimentoNovo.valores.impostos.icms.difal">
          <label>DIFAL ORIGEM</label>
          <md-input v-model="movimentoNovo.valores.impostos.icms.difal.origem"></md-input>
        </md-field>
        <md-field class="md-layout-item md-size-50" v-if="movimentoNovo.valores.impostos.icms.difal">
          <label>DIFAL DESTINO</label>
          <md-input v-model="movimentoNovo.valores.impostos.icms.difal.destino"></md-input>
        </md-field>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="editar" :disabled="!modificado">EDITAR</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem"
      md-confirm-text="Ok" />
  </span>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faEdit } from '@fortawesome/fontawesome-free-solid'
import { editarMovimento } from './services'

export default {
  components: {
    FontAwesomeIcon
  },
  name: 'editar-movimento',
  props: ['id', 'movimento', 'cnpj', 'editado'],
  created () {
    if (!this.$props.movimento.metaDados) {
      this.$props.movimento.metaDados = {
        criadoPor: 'DESCONHECIDO',
        dataCriacao: new Date('07/19/1997').toISOString(),
        status: 'ATIVO',
        tipo: 'PRIM'
      }
    }

    let movimentoInicial = JSON.parse(JSON.stringify(this.$props.movimento))
    let movimentoNovo = JSON.parse(JSON.stringify(this.$props.movimento))

    movimentoNovo.metaDados = {
      criadoPor: this.$store.state.usuario.email,
      dataCriacao: new Date().toISOString(),
      tipo: 'SUB',
      status: 'ATIVO',
      movimentoRef: this.$props.id
    }
    this.$data.movimentoInicial = movimentoInicial
    this.$data.movimentoNovo = movimentoNovo
  },
  data () {
    return {
      movimentoInicial: null,
      movimentoNovo: null,
      mostra: false,
      erro: {
        mostra: false,
        mensagem: ''
      }
    }
  },
  methods: {
    chamarErro (err) {
      this.$data.erro.mostra = true
      this.$data.erro.mensagem = err.message
    },
    editar () {
      editarMovimento(this.$data.movimentoNovo, this.$props.cnpj, err => {
        if (err) {
          console.error(err)
        } else {
          this.chamarErro(new Error('Movimento editado com sucesso!'))
          this.$data.mostra = false
          this.$props.editado()
        }
      })
    }
  },
  computed: {
    faEdit: _ => faEdit,
    modificado () {
      let movimentoInicial = this.$data.movimentoInicial
      let movimentoNovo = this.$data.movimentoNovo

      if (JSON.stringify(movimentoNovo.valores.impostos) === JSON.stringify(movimentoInicial.valores.impostos)) {
        return false
      } else {
        return true
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
