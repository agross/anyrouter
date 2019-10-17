<template>
  <section>
    <h3><font-awesome-icon icon="check-double" /> Monitors</h3>
    <ul>
      <MonitorListItem v-for="event of events"
                       v-bind:key="event.data.description"
                       :subscribe="event"></MonitorListItem>
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
    const existing = this.events[event.type + event.data.description];

    if (existing) {
      return;
    }

    Vue.set(this.events, event.type + event.data.description, event);
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
