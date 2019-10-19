<template>
  <li :class="[latestEvent.status]">
    <div>
      <font-awesome-icon :icon="icon"
                         :spin="running"/>
      {{ latestEvent.data.description }}
    </div>
    <div v-if="latestDataEvent && latestDataEvent.error">
      {{ latestDataEvent.error.reason }}
    </div>
    <div v-if="latestDataEvent && latestDataEvent.result">
      {{ latestDataEvent.result.ip }}
    </div>
  </li>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';
import Monitor from './Monitor.vue';

@Component({})
export default class StaticValue extends Mixins<Monitor>(Monitor) {
  public static canHandle(eventType: string): boolean {
    return true;
  }
}
</script>

<style scoped lang="scss">
li {
  flex: 1 1 0;
  list-style: none;
  padding-block-start: 1rem;
  padding-inline-start: 1rem;

  &.successful svg {
    color: green;
  }

  &.failed svg {
    color: red;
  }
}
</style>
