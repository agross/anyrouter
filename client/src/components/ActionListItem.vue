<template>
  <li>
    <button :disabled="isCurrentDefaultGateway"
            :data-gateway="gateway.host">
      <font-awesome-icon icon="check" v-if="isCurrentDefaultGateway" /> Use {{ gateway.description }}
    </button>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class ActionListItem extends Vue {
  @Prop({ required: true }) private gateway!: any;
  private currentDefaultGateway: any;

  private get isCurrentDefaultGateway(): boolean {
    return this.gateway.host === this.currentDefaultGateway;
  }

  @Socket('events')
  private receivedEvent(event: any) {
    if (event.type !== 'get-default-gateway') {
      return;
    }

    if (event.status !== 'successful') {
      return;
    }

    this.currentDefaultGateway = event.result;
  }
}
</script>

<style scoped lang="scss">
button[disabled] {
  color: green;
}
</style>
