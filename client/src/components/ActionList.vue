<template>
  <section>
    <h3><font-awesome-icon icon="magic" /> Actions</h3>
    <ul>
      <ActionListItem title="One"></ActionListItem>
      <ActionListItem title="Two"></ActionListItem>
    </ul>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ActionListItem from './ActionListItem.vue';

@Component({
  components: {
    ActionListItem,
  },
})
export default class ActionList extends Vue {
}
</script>

<style scoped lang="scss">
</style>
