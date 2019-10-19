<template>
  <section>
    <h3><font-awesome-icon icon="check-double" /> Monitors</h3>
    <ul>
      <component v-for="(events, key) of sortedEvents"
                 :key="key"
                 :is="monitorFor(events)"
                 :events="events"></component>
    </ul>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import Timing from './monitors/Timing.vue';
import StaticValue from './monitors/StaticValue.vue';
import SpeedTest from './monitors/SpeedTest.vue';
import sortKeys from 'sort-keys';

@Component({})
export default class MonitorList extends Vue {
  private events: { [key: string]: any[] } = {};

  @Socket('eventHistory')
  private eventHistory(events: any[]) {
    this.addEvents(false, ...events);
  }

  @Socket('events')
  private event(event: any) {
    this.addEvents(true, event);
  }

  private addEvents(onlyNewTypes = false, ...events: any[]) {
    events.forEach(event => {
      const key = `${event.data.description}-${event.type}`;

      if (onlyNewTypes && this.events[key]) {
        return;
      }

      const arr = this.events[key] || [];
      arr.push(event);
      Vue.set(this.events, key, arr);
    });
  }

  private get sortedEvents() {
    return sortKeys(this.events);
  }

  private monitorFor(events: any[]) {
    const event = events[0].type;

    return [Timing, SpeedTest, StaticValue].find(m => m.canHandle(event));
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
