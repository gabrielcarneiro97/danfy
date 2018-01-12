<template>
<div>
  <md-field>
    <label>Multiple</label>
    <md-file multiple @change="mudou" accept=".xml"/>
  </md-field>
  <md-button @click="importar">TOP</md-button>
    
</div>
</template>

<script>
import { xml2js } from 'xml-js'

export default {
  data () {
    return {
      arquivos: null
    }
  },
  methods: {
    importar () {
      let arquivos = this.$data.arquivos
      let tamanho = arquivos.length

      for (let index = 0; index < tamanho; index++) {
        let leitor = new FileReader()

        let arquivo = arquivos[index]       

        leitor.readAsText(arquivo)
          
        leitor.onload = () => {
          let dados = leitor.result
          let obj = xml2js(dados, {compact: true})

          if(!obj.nfeProc) return 0
          if(!obj.nfeProc.NFe) return 0
          if(!obj.nfeProc.NFe.Signature) return 0

          let info = obj.nfeProc.NFe.infNFe

          console.log(info)

        }
      }

    },
    mudou (e) {
      this.$data.arquivos = e.target.files
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
