<template>
<div>
  <div class="md-layout md-alignment-top-center">
    <div class="md-layout-item md-size-30" style="text-align: center">
      <font-awesome-icon :icon="faFileAlt" size="6x" />
    </div>
  </div>
</div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faFileAlt } from '@fortawesome/fontawesome-free-regular'

export default {
  computed: {
    faFileAlt () {
      return faFileAlt
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style lang="sass" scoped>

</style>
