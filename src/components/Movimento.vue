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

          let notaId = info['_attributes'].Id.split('NFe')[1]

          console.log(notaId)


          let emit = info.emit
          let emitenteId = emit.CNPJ['_text']
          let emitente = {
            nome: emit.xNome['_text'],
            endereco: {
              logradouro: emit.enderEmit.xLgr['_text'],
              numero: emit.enderEmit.nro['_text'],
              complemento: emit.enderEmit.xCpl ? emit.enderEmit.xCpl['_text'] : '',
              bairro: emit.enderEmit.xBairro['_text'],
              municipio: {
                codigo: emit.enderEmit.cMun['_text'],
                nome: emit.enderEmit.xMun['_text']
              },
              estado: emit.enderEmit.UF['_text'],
              pais: {
                codigo: emit.enderEmit.cPais['_text'],
                nome: emit.enderEmit.xPais['_text']
              },
              cep: emit.enderEmit.CEP['_text']
            }
          }

          console.log(emitente)

          let dest = info.dest
          let destId = dest.CPF ? dest.CPF['_text'] : dest.CNPJ['_text']
          let destinatario = {
            nome: dest.xNome['_text'],
            endereco: {
              logradouro: dest.enderDest.xLgr['_text'],
              numero: dest.enderDest.nro['_text'],
              complemento: dest.enderDest.xCpl ? dest.enderDest.xCpl['_text'] : '',
              bairro: dest.enderDest.xBairro['_text'],
              municipio: {
                codigo: dest.enderDest.cMun['_text'],
                nome: dest.enderDest.xMun['_text']
              },
              estado: dest.enderDest.UF['_text'],
              pais: {
                codigo: dest.enderDest.cPais['_text'],
                nome: dest.enderDest.xPais['_text']
              },
              cep: dest.enderDest.CEP['_text']
            }
          }

          console.log(destinatario)


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
