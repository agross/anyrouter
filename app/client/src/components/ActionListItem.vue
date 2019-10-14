<template>
  <li>
    <button :disabled="isDefault"
            v-on:click.prevent="setGateway">
      <font-awesome-icon icon="check"
                         v-if="isDefault" />
      <font-awesome-icon icon="circle-notch"
                         :spin="running"
                         v-if="running" />
      Use {{ gateway.description }}
    </button>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class ActionListItem extends Vue {
  @Prop({ required: true }) private gateway!: any;
  private isDefault = false;
  private running = false;

  private setGateway() {
    this.$socket.client.emit('setDefaultGateway', {
      gateway: this.gateway.host,
    });
  }

  @Socket('events')
  private receivedEvent(event: any) {
    if (!['get-default-gateway', 'set-default-gateway'].includes(event.type)) {
      return;
    }

    if (event.type === 'set-default-gateway') {
      this.running = event.status === 'running' &&
                     event.data.gateway === this.gateway.host;
    }

    if (event.type === 'get-default-gateway' &&
        event.status === 'successful') {
      this.isDefault = event.result === this.gateway.host;
    }
  }
}
</script>

<style scoped lang="scss">
button[disabled] {
  color: green;
}
</style>
