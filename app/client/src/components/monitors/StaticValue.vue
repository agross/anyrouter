<i18n>
{
  "en": {
    "get-default-gateway": "Default gateway",
    "set-default-gateway": "Set {gateway} as default gateway ",
    "public-ip": "Public IP"
  },
  "de": {
    "get-default-gateway": "Standardgateway",
    "set-default-gateway": "Standardgateway {gateway} setzen",
    "public-ip": "Öffentliche IP-Adresse"
  }
}
</i18n>

<template>
  <li :class="[latestEvent.status]">
    <h4>
      <font-awesome-icon class="status"
                         :icon="icon"
                         :spin="running"/>
      {{ $t(latestEvent.type, { gateway: latestEvent.data.gateway }) }}
    </h4>
    <div v-if="latestDataEvent">
      <span v-if="latestDataEvent.error">
        {{ latestDataEvent.error.reason }}
      </span>
      <span v-if="latestDataEvent.result">
        {{ ipOrResult() }}
      </span>
      <font-awesome-icon icon="info-circle"
                         v-tooltip="latestDataEventTimestamp"/>
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

  private get latestDataEventTimestamp() {
    return this.$moment(this.latestDataEvent.timestamp as number).fromNow();
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
