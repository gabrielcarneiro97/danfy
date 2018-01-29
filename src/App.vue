<template>
  <div id="app">
    <navbar class="nav"></navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/Navbar'

export default {
  name: 'app',
  components: {
    Navbar
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
</style>
