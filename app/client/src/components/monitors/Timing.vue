<template>
  <li :class="[latestEvent.status]">
    <div>
      <font-awesome-icon :icon="icon"
                         :spin="running"/>
      {{ latestEvent.data.description }}
    </div>
    <sparkline :indicatorStyles="indicatorStyles"
               :tooltipProps="tooltipProps">
      <sparklineBar :data="errors"
                    :limit="20"
                    :min="0"
                    :max="1"
                    :styles="errorBarStyle" />
      <sparklineCurve :data="rttData"
                      :limit="20"
                      refLineType="avg"
                      :refLineStyles="rttRefLineStyles"
                      :styles="rttGraphStyle" />
    </sparkline>
  </li>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';
import Monitor from './Monitor.vue';

@Component({})
export default class Timing extends Mixins<Monitor>(Monitor) {
  public static canHandle(eventType: string): boolean {
    return eventType === 'ping';
  }

  private get rttData(): number[] {
    return this.dataEvents
      .map(e => {
        if (e.status === 'successful') {
          return e.result.rtt;
        }
        return 0;
      });
  }

  private get rttRefLineStyles() {
    return {
      stroke: 'rgb(44, 62, 80)',
      strokeOpacity: .8,
      strokeDasharray: '2, 2',
    };
  }

  private get rttGraphStyle() {
    return {
      stroke: 'green',
      strokeWidth: 2,
    };
  }

  private get errors() {
    return this.dataEvents
      .map(e => e.status === 'failed' ? 1 : -1);
  }

  private get errorBarStyle() {
    return {
      fill: 'red',
      fillOpacity: 0.8,
    };
  }

  private get indicatorStyles() {
    return {
      stroke: '#000',
    };
  }

  private get tooltipProps() {
    return {
      formatter(val: any) {
        return `<span>${val.value}ms</span>`;
      },
    };
  }
}
</script>

<style scoped lang="scss">
li {
  flex: 1 1 0;
  list-style: none;
  padding-block-start: 1rem;
  padding-inline-start: 1rem;

  &.successful svg {
    color: green;
  }

  &.failed svg {
    color: red;
  }
}
</style>
