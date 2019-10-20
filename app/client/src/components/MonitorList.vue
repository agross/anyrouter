<template>
  <section>
    <h3>
      <font-awesome-icon icon="check-double" />
      Monitors
      <font-awesome-icon icon="circle-notch"
                         :spin="true"
                         v-if="loading" />
    </h3>
    <ul class="monitors">
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
  private loading = false;

  @Socket()
  private connect() {
    this.loading = true;
  }

  @Socket('eventHistory')
  private eventHistory(events: any[]) {
    this.addEvents(false, ...events);

    this.loading = false;
  }

  @Socket('events')
  private event(event: any) {
    this.addEvents(true, event);
  }

  private addEvents(onlyNewTypes: boolean, ...events: any[]) {
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

<style lang="scss">
ul.monitors {
  display: flex;
  flex-wrap: wrap;
  padding: 0;

  li {
    border: 1px solid gray;
    border-radius: 5px;
    margin-block-end: 1rem;
    margin-inline-end: 1rem;
    flex: 0 0 200px;
    list-style: none;
    padding: 1rem;

    &.successful svg {
      color: green;
    }

    &.failed svg {
      color: red;
    }
  }

  h4 {
    margin: 0 0 .5rem 0;
  }
}
</style>
