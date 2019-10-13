<template>
   <li>{{ title }}</li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ActionListItem extends Vue {
  @Prop() private title!: string;
}
</script>

<style scoped lang="scss">
</style>
