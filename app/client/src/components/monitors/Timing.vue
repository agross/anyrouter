<template>
  <li :class="[latest.status]">
    <font-awesome-icon :icon="icon"
                       :spin="running"/>
    {{ latest.data.description }}
    <sparkline>
      <sparklineLine :data="rttData" :limit="20" :styles="rttGraphStyle" />
      <sparklineBar :data="errors" :limit="20" :min="0" :max="1" :styles="errorBarStyle" />
    </sparkline>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class Timing extends Vue {
  public static canHandle(eventType: string): boolean {
    return eventType === 'ping';
  }

  @Prop({ required: true }) private subscribe!: any;

  private events: any[] = [];
  private connected = true;

  private mounted() {
    this.events.push(this.subscribe);
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

    this.events.push(event);
  }

  private get rttData(): number[] {
    return this.events
      .filter(e => e.status !== 'running')
      .map(e => {
        if (e.status === 'successful') {
          return (e.result || {}).rtt;
        }
        return 0;
      });
  }

  private get rttGraphStyle() {
    return {
      stroke: '#54a5ff',
      strokeWidth: 2,
    };
  }

  private get errors() {
    return this.events
      .filter(e => e.status !== 'running')
      .map(e => e.status === 'failed' ? 1 : -1);
  }

  private get errorBarStyle() {
    return {
      fill: '#d14',
      fillOpacity: 0.3,
    };
  }

  private get running() {
    return this.connected &&
           this.latest.status.indexOf('running') !== -1;
  }

  private get icon() {
    return this.connected ? 'circle-notch' : 'plug';
  }

  private get latest() {
    return this.events.slice(-1)[0] || this.subscribe;
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
