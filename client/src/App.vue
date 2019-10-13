<template>
  <div id="app">
    <h1><font-awesome-icon icon="route" /> anyrouter</h1>
    <ActionList></ActionList>
    <MonitorList></MonitorList>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActionList from './components/ActionList.vue';
import MonitorList from './components/MonitorList.vue';

@Component({
  components: {
    ActionList,
    MonitorList,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: auto;
  margin-right: auto;
  width: 200px;
}
</style>
