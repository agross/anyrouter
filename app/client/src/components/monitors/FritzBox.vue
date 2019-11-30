<i18n>
{
  "en": {
    "fritzbox": "FRITZ!Box {host}"
  }
}
</i18n>

<template>
  <li :class="[latestEvent.status]">
    <h4>
      <font-awesome-icon class="status"
                         :icon="icon"
                         :spin="running"/>
      <span>{{ $t(latestEvent.type, { host: latestEvent.data.description }) }}</span>
    </h4>
    <div v-if="latestDataEvent"
         class="info">
      <span v-if="latestDataEvent.error">
        {{ latestDataEvent.error.reason }}
      </span>
      <span v-if="latestDataEvent.result">
        <span class="download">⬇</span> {{ toKilobytes(latestDataEvent.result.NewByteReceiveRate) }} KB/s
        <span class="upload">⬆</span> {{ toKilobytes(latestDataEvent.result.NewByteSendRate) }} KB/s
      </span>

      <font-awesome-icon icon="info-circle"
                         v-tooltip="latestDataEventTimestamp"/>
    </div>
    <div v-if="errors.length > 1 || downloadSpeedData.length > 1 || uploadSpeedData.length > 1">
      <sparkline :indicatorStyles="indicatorStyles"
                 :tooltipProps="tooltipProps"
                 :width="220">
        <sparklineBar :data="errors"
                      :limit="errors.length"
                      :min="0"
                      :max="1"
                      :margin="1"
                      :styles="errorBarStyle" />
        <sparklineCurve :data="downloadSpeedData"
                        :limit="downloadSpeedData.length"
                        :min="0"
                        :styles="downloadGraphStyle" />
      </sparkline>
      <sparkline :indicatorStyles="indicatorStyles"
                 :tooltipProps="tooltipProps"
                 :width="220">
        <sparklineBar :data="errors"
                      :limit="errors.length"
                      :min="0"
                      :max="1"
                      :margin="1"
                      :styles="errorBarStyle" />
        <sparklineCurve :data="uploadSpeedData"
                        :limit="uploadSpeedData.length"
                        :min="0"
                        :styles="uploadGraphStyle" />
      </sparkline>
    </div>
  </li>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { Component, Mixin, Mixins } from 'vue-mixin-decorator';
import { Socket } from 'vue-socket.io-extended';
import Monitor from './Monitor.vue';

@Component({})
export default class FritzBox extends Mixins<Monitor>(Monitor) {
  public static canHandle(eventType: string): boolean {
    return eventType === 'fritzbox';
  }

  public static toKilobytes(val: number) {
    return Math.round(val / 1024);
  }

  private DOWNLOAD_COLOR = 'green';
  private UPLOAD_COLOR = 'goldenrod';

  private toKilobytes(val: number) {
    return FritzBox.toKilobytes(val);
  }

  private get downloadSpeedData(): number[] {
    return this.dataEvents
      .map(e => {
        if (e.status === 'successful') {
          return e.result.NewByteReceiveRate;
        }
        return 0;
      });
  }

  private get uploadSpeedData(): number[] {
    return this.dataEvents
      .map(e => {
        if (e.status === 'successful') {
          return e.result.NewByteSendRate;
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
      stroke: '#2c3e50',
    };
  }

  private get tooltipProps() {
    const that = this;

    return {
      formatter(val: any) {
        const event = that.dataEvents[val.index];

        let message;
        if (event.status === 'successful') {
          message = `<span class="download">⬇</span> ${FritzBox.toKilobytes(event.result.NewByteReceiveRate)} KB/s (${event.result.NewByteReceiveRate} B/s)<br>
            <span class="upload">⬆</span> ${FritzBox.toKilobytes(event.result.NewByteSendRate)} KB/s (${event.result.NewByteSendRate} B/s)`;
        } else {
          const err = event.error && event.error.reason;

          message = `❌ ${err}`;
        }

        const ts = that.$moment(event.timestamp as number);

        return `<div>
            ${message}<br>
            <span class="timestamp">${ts.fromNow()}</span>
          </div>`;
      },
    };
  }
}
</script>

<style scoped lang="scss">
.download {
  color: green;
}

.upload {
  color: goldenrod;
}
</style>
