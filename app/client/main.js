const app = new Vue({
  el: '#app',
  data: {
    title: 'Router Config',
    name: '',
    text: '',
    messages: [],
    socket: null
  },
  methods: {
    sendMessage() {
      this.socket.emit('msgToServer', message)
    },
    receivedMessage(message) {
      this.messages.push(message);
    },
  },
  created() {
    this.socket = io('/');
    this.socket.on('events', (message) => {
      this.receivedMessage(message);
    });
  }
});
