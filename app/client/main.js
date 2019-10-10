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
      console.log('res: ' + message);
      this.messages.push(message);
    },
  },
  created() {
    this.socket = io('http://localhost:3000')
    this.socket.on('events', (message) => {
      this.receivedMessage(message);
    });
  }
});
