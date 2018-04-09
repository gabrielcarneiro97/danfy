<template>
  <v-dialog v-model="sync" max-width="20vw">
    <v-card>
      <v-card-title>
        <span>{{mensagem}}</span>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click.stop="$emit('fechar-erro')">FECHAR</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'erro',
  props: ['mensagem', 'sync']
}
</script>

<style lang="scss" scoped>

</style>

