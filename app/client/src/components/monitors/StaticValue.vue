<template>
  <li :class="[latestEvent.status]">
    <h4>
      <font-awesome-icon :icon="icon"
                         :spin="running"/>
      {{ latestEvent.data.description }}
    </h4>
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
</style>
