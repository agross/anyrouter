<template>
  <section>
    <h3><font-awesome-icon icon="check-double" /> Monitors</h3>
    <ul>
      <MonitorListItem v-for="event of events"
                       v-bind:key="event.data.description"
                       :event="event"></MonitorListItem>
    </ul>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MonitorListItem from './MonitorListItem.vue';
import { Socket } from 'vue-socket.io-extended';

@Component({
  components: {
    MonitorListItem,
  },
})
export default class MonitorList extends Vue {
  private events: { [key: string]: any } = {};

  @Socket()
  private connect() {
    this.events = {};
  }

  @Socket('events')
  private receivedEvent(event: any) {
    event.timestamp = new Date(event.timestamp);
    const existing = this.events[event.type + event.data.description] || {};
    const extended = Object.assign({}, existing, event);
    if (extended.status === 'running') {
      extended.status += ' ' + existing.status;
    }
    Vue.set(this.events, event.type + event.data.description, extended);
  }
}
</script>

<style scoped lang="scss">
</style>
