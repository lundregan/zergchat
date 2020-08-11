const app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      console.log(`${msg.name} : ${msg.msg}`);
      io.emit('chat message', msg);
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('Listening on Port 3000')
});