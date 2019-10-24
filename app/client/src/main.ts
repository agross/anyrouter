import Vue from 'vue';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faRoute,
  faExchangeAlt,
  faCheckDouble,
  faMagic,
  faCircleNotch,
  faCheck,
  faPlug,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

library.add(faRoute);
library.add(faExchangeAlt);
library.add(faCheckDouble);
library.add(faMagic);
library.add(faCircleNotch);
library.add(faCheck);
library.add(faPlug);
library.add(faInfoCircle);
Vue.component('font-awesome-icon', FontAwesomeIcon);

import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';

function createSocket() {
  if (process.env.NODE_ENV === 'production') {
    return io();
  }

  return io('http://localhost:3000');
}

Vue.use(VueSocketIOExt, createSocket());

import Sparkline from 'vue-sparklines';
import SparklineTooltipPatch from './sparkline-tooltip-patch';
Vue.use(Sparkline);
SparklineTooltipPatch.apply();

import VTooltip from 'v-tooltip';
Vue.use(VTooltip, { defaultTrigger: 'hover focus click'});

const locale = navigator.language.split('-')[0];

import VueI18n from 'vue-i18n';
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale,
  fallbackLocale: 'en',
  formatFallbackMessages: true,
  silentFallbackWarn: true,
});

import moment from 'moment';
import 'moment/locale/de';
moment.locale(locale);

import * as VueMoment from 'vue-moment';
Vue.use(VueMoment, { moment });

Vue.config.productionTip = false;

new Vue({
  i18n,
  render: (h) => h(App),
}).$mount('#app');
