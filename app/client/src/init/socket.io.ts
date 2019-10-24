import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';

function createSocket() {
  if (process.env.NODE_ENV === 'production') {
    return io();
  }

  return io('http://localhost:3000');
}

export default {
  install(vue: Vue.VueConstructor) {
    vue.use(VueSocketIOExt, createSocket());
  },
};
