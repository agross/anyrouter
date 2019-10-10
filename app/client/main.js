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
    setDefaultGateway: function () {
      this.socket.emit('setDefaultGateway', { gateway: '172.18.0.5' }, response => {
        console.log(response);
      });
    },
    setDefaultGateway2: function () {
      this.socket.emit('setDefaultGateway', { gateway: '172.18.0.1' }, response => {
        console.log(response);
      });
    },
    setStatus: function (status, exception) {
      this.status = status;
      this.exception = exception;
    },
    receivedEvent: function (event) {
      event.timestamp = new Date(event.timestamp);
      const existing = this.events[event.type + event.data.description] || {};
      extended = Object.assign({}, existing, event);
      Vue.set(this.events, event.type + event.data.description, extended);
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
