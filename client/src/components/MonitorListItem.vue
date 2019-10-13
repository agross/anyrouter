<template>
   <li :class="[event.status]">
     <font-awesome-icon icon="circle-notch"
                        :spin="event.status == 'running'"/>
     {{ event.data.description }}
   </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MonitorListItem extends Vue {
  @Prop() private event = {};
}
</script>

<style scoped lang="scss">
li.successful svg {
  color: green;
}

li.running svg {
  color: goldenrod;
}

li.failed svg {
  color: red;
}
</style>
