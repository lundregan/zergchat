const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var chatHistory = [
    {
        name: "System",
        msg: "Welcome to zChat"
    }
]

const updateChatHistory = (msg) => {
    chatHistory.push(msg);
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => {
    socket.emit('update chat history', chatHistory);

    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });

    socket.on('chat message', (msg) => {
    
      console.log(`${msg.name} : ${msg.msg}`);
    
        updateChatHistory(msg);

      io.emit('chat message', msg);
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('Listening on Port 3000')
});