<i18n>
{
  "en": {
    "actions": "Actions"
  },
  "de": {
    "actions": "Aktionen"
  }
}
</i18n>

<template>
  <section>
    <h3><font-awesome-icon icon="magic" /> {{ $t('actions') }}</h3>
    <ul>
      <SetDefaultGateway v-for="gateway of gateways"
                         v-bind:key="gateway.host"
                         :gateway="gateway"></SetDefaultGateway>
    </ul>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import SetDefaultGateway from './actions/SetDefaultGateway.vue';
import { Socket } from 'vue-socket.io-extended';

@Component({
  components: {
    SetDefaultGateway,
  },
})
export default class ActionList extends Vue {
  private gateways = [];

  @Socket('gateways')
  private receivedGateways(gateways: []) {
    this.gateways = gateways;
  }
}
</script>

<style scoped lang="scss">
ul {
  display: flex;
  flex-wrap: wrap;
  padding: 0;

  li {
    list-style: none;
    margin-block-end: 1rem;
    margin-inline-end: 1rem;
  }
}
</style>
