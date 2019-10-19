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
                    :limit="errors.length"
                    :min="0"
                    :max="1"
                    :margin="1"
                    :styles="errorBarStyle" />
      <sparklineCurve :data="downloadSpeedData"
                      :limit="downloadSpeedData.length"
                      :min="0"
                      :max="maxDataValue"
                      :styles="downloadGraphStyle" />
      <sparklineCurve :data="uploadSpeedData"
                      :limit="uploadSpeedData.length"
                      :min="0"
                      :max="maxDataValue"
                      :styles="uploadGraphStyle" />
    </sparkline>
  </li>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';
import * as moment from 'moment';
import Monitor from './Monitor.vue';

@Component({})
export default class SpeedTest extends Mixins<Monitor>(Monitor) {
  public static canHandle(eventType: string): boolean {
    return eventType === 'speed-test';
  }

  private DOWNLOAD_COLOR = 'green';
  private UPLOAD_COLOR = 'goldenrod';

  private get downloadSpeedData(): number[] {
    return this.dataEvents
      .map(e => {
        if (e.status === 'successful') {
          return e.result.speeds.download;
        }
        return 0;
      });
  }

  private get uploadSpeedData(): number[] {
    return this.dataEvents
      .map(e => {
        if (e.status === 'successful') {
          return e.result.speeds.upload;
        }
        return 0;
      });
  }

  private get maxDataValue(): number {
    return Math.max(...this.downloadSpeedData.concat(this.uploadSpeedData));
  }

  private get downloadGraphStyle() {
    return {
      stroke: this.DOWNLOAD_COLOR,
      strokeWidth: 2,
    };
  }

  private get uploadGraphStyle() {
    return {
      stroke: this.UPLOAD_COLOR,
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
      fillOpacity: 0.5,
    };
  }

  private get indicatorStyles() {
    return {
      stroke: '#000',
    };
  }

  private get tooltipProps() {
    const that = this;

    return {
      formatter(val: any) {
        const event = that.dataEvents[val.index];

        let message;
        if (event.status === 'successful') {
          message = `<span style="color: ${that.DOWNLOAD_COLOR}">⬇</span> ${event.result.speeds.download} Mbit/s<br>
            <span style="color: ${that.UPLOAD_COLOR}">⬆</span> ${event.result.speeds.upload} Mbit/s`;
        } else {
          const err = event.error && event.error.reason;

          message = `❌ ${err}`;
        }

        const ts = moment.default(event.timestamp);

        return `<div>
            ${message}<br>
            ${ts.fromNow()}
          </div>`;
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
