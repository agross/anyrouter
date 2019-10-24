import Sparkline from 'vue-sparklines';
import SparklineTooltipPatch from './sparkline-tooltip-patch';

export default {
  install(vue: Vue.VueConstructor) {
    vue.use(Sparkline);
    SparklineTooltipPatch.apply();
  },
};
