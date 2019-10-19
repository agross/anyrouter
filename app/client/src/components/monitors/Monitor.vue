<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';

@Mixin({})
export default class Monitor extends Vue {
  private connected = true;
  private events: any[] = [];

  @Prop({ required: true }) private subscribe!: any;

  protected get dataEvents() {
    return this.allEvents.filter(e => e.status !== 'running');
  }

  protected get latestDataEvent(): any {
    return this.dataEvents.slice(-1)[0];
  }

  protected get latestEvent(): any {
    return this.allEvents.slice(-1)[0];
  }

  protected get running() {
    return this.connected &&
           this.latestEvent.status.indexOf('running') !== -1;
  }

  protected get icon() {
    return this.connected ? 'circle-notch' : 'plug';
  }

  private mounted() {
    this.events.push(this.subscribe);
  }

  private get allEvents() {
    if (this.events.length > 0) {
      return this.events;
    }

    return [this.subscribe];
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
    if (!this.subscribedTo(event)) {
      return;
    }

    this.addEvent(event);
  }

  private subscribedTo(event: any) {
    return this.subscribe.type === event.type &&
           this.subscribe.data.description === event.data.description;
  }

  private addEvent(event: any) {
    event.timestamp = new Date(event.timestamp);
    this.events.push(event);

    if (this.events.length > 40) {
      this.events.shift();
    }
  }
}
</script>
