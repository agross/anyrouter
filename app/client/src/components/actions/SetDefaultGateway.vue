<i18n>
{
  "en": {
    "use": "Use {gateway}"
  },
  "de": {
    "use": "{gateway} benutzen"
  }
}
</i18n>

<template>
  <li>
    <button :disabled="isDefault || !connected"
            v-on:click.prevent="setDefaultGateway">
      <font-awesome-icon icon="check"
                         v-if="isDefault" />
      <font-awesome-icon icon="circle-notch"
                         :spin="running"
                         v-if="running" />
      {{ $t('use', { gateway: gateway.description }) }}
    </button>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class SetDefaultGateway extends Vue {
  @Prop({ required: true }) private gateway!: any;
  private connected = true;
  private isDefault = false;
  private running = false;

  private setDefaultGateway() {
    this.$socket.client.emit('setDefaultGateway', {
      gateway: this.gateway.host,
    });
  }

  @Socket()
  private connect() {
    this.connected = true;
  }

  @Socket()
  private disconnect() {
    this.connected = false;
  }

  @Socket('events')
  private receivedEvent(event: any) {
    if (!['get-default-gateway', 'set-default-gateway'].includes(event.type)) {
      return;
    }

    if (event.type === 'set-default-gateway') {
      this.running = event.status === 'running' &&
                     event.data.gateway === this.gateway.host;

      if (event.status === 'successful') {
        this.isDefault = event.result.ip === this.gateway.host;
      }
    }

    if (event.type === 'get-default-gateway' &&
        event.status === 'successful') {
      this.isDefault = event.result.ip === this.gateway.host;
    }
  }
}
</script>

<style scoped lang="scss">
button {
  $active: green;
  $inactive-hover:  #2c3e50;
  $inactive: lighten($color: $inactive-hover, $amount: 5%);

  background: $inactive;
  border: $inactive;
  color: white;
  font-size: 1rem;
  padding: .5rem;
  border-radius: 5px;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  transition: background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;

  &:hover {
    background: $inactive-hover;
  }

  &:focus {
    box-shadow: 0 0 0 0.2rem rgba($inactive, .5);
  }

  &[disabled] {
    background: $active;
    border: $active;
    cursor: not-allowed;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
