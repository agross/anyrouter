<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';

@Mixin({})
export default class Monitor extends Vue {
  private connected = true;
  private MAX_EVENTS = 40;
  private latestDataEventTimestampTimer: any;
  private latestDataEventTimestamp: string = '';

  @Prop({ required: true }) private events!: any[];


  private created() {
    this.updateLatestDataEventTimestamp();

    this.latestDataEventTimestampTimer = setInterval(this.updateLatestDataEventTimestamp,
                                                     60000);
  }

  private destroyed() {
    clearInterval(this.latestDataEventTimestampTimer);
  }

  private get allDataEvents() {
    return this.events
    .filter(e => e.status === 'successful' || e.status === 'failed');
  }

  protected get dataEvents() {
    return this.allDataEvents.slice(-1 * this.MAX_EVENTS);
  }

  protected get latestDataEvent(): any {
    return this.dataEvents.slice(-1)[0];
  }

  protected get latestEvent(): any {
    return this.events.slice(-1)[0];
  }

  private updateLatestDataEventTimestamp() {
    if (this.latestDataEvent) {
      const timestamp = this.latestDataEvent.timestamp as number;
      this.latestDataEventTimestamp = this.$moment(timestamp).fromNow();
    }
  }

  protected get running() {
    return this.connected &&
           this.latestEvent.status === 'running';
  }

  protected get icon() {
    return this.connected ? 'circle-notch' : 'plug';
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
    if (!this.shouldListenTo(event)) {
      return;
    }

    this.addEvent(event);
  }

  private shouldListenTo(event: any): boolean {
    return this.latestEvent.type === event.type &&
           this.latestEvent.data.id === event.data.id;
  }

  private addEvent(event: any) {
    this.events.push(event);

    if (this.allDataEvents.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    this.updateLatestDataEventTimestamp();
  }
}
</script>
