<template>
  <div id="app">
    <h1 :class="{ connected }">
      <font-awesome-icon icon="route"/>
      anyrouter
    </h1>
    <ActionList></ActionList>
    <MonitorList></MonitorList>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import ActionList from './components/ActionList.vue';
import MonitorList from './components/MonitorList.vue';

@Component({
  components: {
    ActionList,
    MonitorList,
  },
})
export default class App extends Vue {
  private connected = false;

  @Socket()
  private connect() {
    this.connected = true;

    this.updateHead();
  }

  @Socket()
  private disconnect() {
    this.connected = false;

    this.updateHead();
  }

  private mounted() {
    this.updateHead();
  }

  private updateHead() {
    const type = this.connected ? 'green' : 'red';

    document.querySelectorAll('link[rel="icon"]')
      .forEach(icon => {
      const i = icon as HTMLLinkElement;

      let href = i.href;
      if (href.includes('/favicon/')) {
        href = href.replace(new RegExp('/favicon/\\w+/'), `/favicon/${type}/`);
      } else {
        href = href.replace('/favicon-', `/favicon/${type}/favicon-`);
      }

      i.href = href;
    });
  }
}
</script>

<style lang="scss">
$text-color: #2c3e50;

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $text-color;

  margin-left: auto;
  margin-right: auto;
  width: 80%;
}

@media screen and (min-width: 768px) {
  body {
    margin-top: 60px;
  }
}

h1 {
  color: red;

  &.connected {
    color: green;
  }
}

@for $i from 1 through 6 {
  h#{$i} {
    white-space: nowrap;
  }
}

.sparkline-tooltip {
  .timestamp {
    white-space: nowrap;
  }
}

.has-tooltip {
  outline: none;
}

.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: $text-color;
    color: white;
    border-radius: 5px;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: $text-color;
    z-index: 1;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &.popover {
    $color: #f9f9f9;

    .popover-inner {
      background: $color;
      color: $text-color;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, .1);
    }

    .popover-arrow {
      border-color: $color;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}
</style>
