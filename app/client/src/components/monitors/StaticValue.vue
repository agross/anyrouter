<template>
  <li :class="[latest.status]">
    <font-awesome-icon :icon="icon"
                       :spin="running"/>
    {{ latest.data.description }}
    {{ latest }}
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class StaticValue extends Vue {
  public static canHandle(eventType: string): boolean {
    return eventType !== 'ping';
  }

  @Prop({ required: true }) private subscribe!: any;

  private _latest: any;
  private connected = true;

  private mounted() {
    this._latest = this.subscribe;
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
    if (!(this.subscribe.type === event.type &&
        this.subscribe.data.description === event.data.description)) {
      return;
    }

    event.timestamp = new Date(event.timestamp);

    this._latest = event;
  }

  private get running() {
    return this.connected &&
           this.latest.status.indexOf('running') !== -1;
  }

  private get icon() {
    return this.connected ? 'circle-notch' : 'plug';
  }

  private get latest() {
    return this._latest || this.subscribe;
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
