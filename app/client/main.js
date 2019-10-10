Vue.use(vueMoment);

const app = new Vue({
  el: '#app',
  data: {
    title: 'anyrouter',
    socket: null,
    status: null,
    exception: null,
    events: {}
  },
  methods: {
    sendMessage: function() {
      this.socket.emit('msgToServer', message);
    },
    setStatus: function (status, exception) {
      this.status = status;
      this.exception = exception;
    },
    receivedEvent: function (event) {
      event.timestamp = new Date(event.timestamp);
      Vue.set(this.events, event.type + event.data, event);
    }
  },
  created() {
    this.socket = io('/');
    this.socket.on('connect', () => {
      this.setStatus('connected');
    });
    this.socket.on('exception', data => {
      this.status = 'exception';
      this.exception = data;
    });
    this.socket.on('disconnect', () => {
      this.setStatus('disconnected');
    });
    this.socket.on('events', event => {
      this.receivedEvent(event);
    });
  }
});
