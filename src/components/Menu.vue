<template>
<div>
  <div class="md-layout md-alignment-top-center" id="form">
    <div class="md-layout-item md-size-85" id="inner">
        <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
          <md-button class="md-layout-item md-size-100 md-primary" to="/importar">IMPORTAR</md-button>
        </div>
        <div class="md-layout md-layout-item md-size-100 md-alignment-top-right">
          <md-button class="md-layout-item md-size-100 md-primary" to="/mostrarMovimentos">VISUALIZAR MOVIMENTOS</md-button>
        </div>

    </div>
  </div>
</div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
#form {
  margin-top: 5%;
  margin-bottom: 2%;
}
#inner {
  padding: 1%;
  background-color: rgb(255, 255, 255)
}
</style>
