import Vue from 'vue';
import App from './App.vue';

import FontAwesome from './init/fontawesome';
Vue.use(FontAwesome);

import SocketIO from './init/socket.io';
Vue.use(SocketIO);

import Sparkline from 'vue-sparklines';
Vue.use(Sparkline);

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

import VueMoment from 'vue-moment';
Vue.use(VueMoment, { moment });

Vue.config.productionTip = false;

new Vue({
  i18n,
  render: (h) => h(App),
}).$mount('#app');
