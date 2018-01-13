<template>
    <div>

    </div>
</template>

<script>
import store from '../store'
import { pegarDominio, usuarioAtivo } from './services/firebase.service'

export default {
  data () {
      return {

      }
  },
  created () {
    usuarioAtivo(ativo => {
      if(!ativo) 
        this.$router.push('/login')
      else   
        pegarDominio(dominio => {
          console.log(dominio)
        })
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
