Vue.use(vueMoment);

const app = new Vue({
  el: '#app',
  data: {
    title: 'anyrouter',
    socket: null,
    status: null,
    exception: null,
    events: {},
    gateways: []
  },
  methods: {
    setDefaultGateway: function (event) {
      event.target
      this.socket.emit('setDefaultGateway', {
            gateway: event.target.dataset.gateway
          }, response => {
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
    },
    receivedGateways: function(gateways) {
      this.gateways = gateways;
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
    this.socket.on('gateways', gateways => {
      this.receivedGateways(gateways);
    });
  }
});
