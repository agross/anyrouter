<template>
  <section>
    <h3><font-awesome-icon icon="check-double" />Monitors</h3>
    <ul>
      <MonitorListItem title="One" :running="true"></MonitorListItem>
      <MonitorListItem title="Two"></MonitorListItem>
    </ul>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MonitorListItem from './MonitorListItem.vue';

@Component({
  components: {
    MonitorListItem,
  },
})
export default class MonitorList extends Vue {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
