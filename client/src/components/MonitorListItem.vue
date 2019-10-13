<template>
   <li><font-awesome-icon icon="circle-notch" :spin="running"/> {{ title }}</li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MonitorListItem extends Vue {
  @Prop() private title!: string;
  @Prop() private running!: boolean;
}
</script>

<style scoped lang="scss">
</style>
