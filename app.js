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

var rooms = {
    klma: {
        name: "klma",
        chatHistory: [
            {
                name: "System",
                msg: "Welcome to zhcat | Room - klma"
            }
        ]
    }
}

const updateChatHistory = (room, msg) => {
    rooms[room].chatHistory.push(msg);
    rooms[room].chatHistory.push({name: msg.name, msg: msg.msg})
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
})

io.on('connection', (socket) => {
    // socket.emit('update chat history', chatHistory);

    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });

    socket.on('request chat history update', (room) => {
        console.log(`Chat history request for room: ${room}`);
        
        if(rooms[room]){
            socket.emit('update chat history', rooms[room].chatHistory);
        }
    });

    socket.on('chat message', (msg) => {
      console.log(`${msg.room} | ${msg.name} : ${msg.msg}`);
    
        updateChatHistory(msg.room, msg);

        io.to(msg.room).emit('chat message', msg);
        //io.emit('chat message', msg);
    });

    socket.on('change room', (room) => {
        console.log(`${socket.id} changing room to ${room}`)

        if(!rooms[room]){
            rooms[room] = {
                name: room,
                chatHistory: [
                    {
                        name: "System",
                        msg: "Test add chat history"
                    }
                ]
            }

            socket.emit('update chat history', rooms[room].chatHistory);
        }

        socket.join(room);
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('Listening on Port 3000')
});