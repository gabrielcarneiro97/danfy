<template>
  <v-dialog v-model="dataSync" max-width="20vw">
    <v-card>
      <v-card-title>
        <span>{{mensagem}}</span>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click.stop="fechar()">FECHAR</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'erro',
  props: ['mensagem', 'sync'],
  methods: {
    fechar () {
      this.$data.dataSync = false
      this.$emit('fechar-erro')
    }
  },
  data () {
    return {
      dataSync: this.$props.sync
    }
  },
  watch: {
    sync (newVal, oldVal) {
      this.$data.dataSync = newVal
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

