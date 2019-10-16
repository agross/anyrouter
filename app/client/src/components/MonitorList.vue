<template>
  <section>
    <h3><font-awesome-icon icon="check-double" /> Monitors</h3>
    <ul>
      <component v-for="event of events"
                 :key="event.data.description + 'f'"
                 :is="monitorFor(event.type)"
                 :subscribe="event"></component>
    </ul>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import Timing from './monitors/Timing.vue';
import StaticValue from './monitors/StaticValue.vue';

@Component({})
export default class MonitorList extends Vue {
  private events: { [key: string]: any } = {};

  @Socket()
  private connect() {
    this.events = {};
  }

  @Socket('events')
  private receivedEvent(event: any) {
    const existing = this.events[event.type + event.data.description];

    if (existing) {
      return;
    }

    Vue.set(this.events, event.type + event.data.description, event);
  }

  private monitorFor(event: any) {
    return [StaticValue, Timing].find(m => m.canHandle(event));
  }
}
</script>

<style scoped lang="scss">
ul {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
}
</style>
