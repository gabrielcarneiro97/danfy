<template>
    <div>

    </div>
</template>

<script>
import store from '../store'
import { pegarDominio } from './services/firebase.service'

export default {
  data () {
      return {

      }
  },
  created () {
      pegarDominio(dominio => {
          console.log(dominio)
          console.log(store.getState().dominio)
      })
  }
}
</script>

<style lang="scss" scoped>

</style>
