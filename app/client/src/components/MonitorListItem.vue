<template>
   <li :class="[event.status]">
     <font-awesome-icon :icon="icon"
                        :spin="running"/>
     {{ event.data.description }}
   </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class MonitorListItem extends Vue {
  @Prop({ required: true }) private event!: any;

  private connected = true;

  @Socket()
  private connect() {
    this.connected = true;
  }

  @Socket()
  private disconnect() {
    this.connected = false;
  }

  private get running() {
    return this.connected &&
           this.event.status.indexOf('running') !== -1;
  }

  private get icon() {
    return this.connected ? 'circle-notch' : 'plug';
  }
}
</script>

<style scoped lang="scss">
li.successful svg {
  color: green;
}

li.failed svg {
  color: red;
}
</style>
