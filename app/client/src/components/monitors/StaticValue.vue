<template>
  <li :class="[latestEvent.status]">
    <h4>
      <font-awesome-icon class="status"
                         :icon="icon"
                         :spin="running"/>
      {{ latestEvent.data.description }}
    </h4>
    <div>
      <span v-if="latestDataEvent && latestDataEvent.error">
        {{ latestDataEvent.error.reason }}
      </span>
      <span v-if="latestDataEvent && latestDataEvent.result">
        {{ ipOrResult() }}
      </span>
      <font-awesome-icon icon="info-circle"
                         v-tooltip="latestEventTimestamp"/>
    </div>
  </li>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';
import Monitor from './Monitor.vue';
import * as moment from 'moment';

@Component({})
export default class StaticValue extends Mixins<Monitor>(Monitor) {
  public static canHandle(eventType: string): boolean {
    return true;
  }

  private get latestEventTimestamp() {
    return moment.default(this.latestDataEvent.timestamp).fromNow();
  }

  private ipOrResult() {
    const ip = this.latestDataEvent.result.ip;
    if (ip) {
      return ip;
    }

    return this.latestDataEvent.result;
  }
}
</script>

<style scoped lang="scss">
</style>
