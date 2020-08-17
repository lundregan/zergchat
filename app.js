const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const updateChatHistory = (room, msg) => {
    rooms[room].chatHistory.push({name: msg.name, msg: msg.msg})

    console.log(rooms[room].chatHistory);
}

var chatHistory = [
    {
        name: "System",
        msg: "Welcome to zChat"
    }
]

var rooms = {
}

app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
})

// Soceket Functionality
io.on('connection', (socket) => {
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

        io.to(msg.room).emit('client chat message', msg);
    });

    socket.on('change room', (room, name) => {
        console.log(`${socket.id} changing room to ${room}`)

        if(!rooms[room]){
            rooms[room] = {
                name: room,
                chatHistory: [
                    {
                        name: "System",
                        msg: `Welcome to zChat | Room - ${room}`
                    }
                ],
                users: [
                    {
                        id: socket.id,
                        name: name
                    }
                ]
            }

            // ADD
            // Send request to client telling them to wipe history and send correct room history
            // But really I shouldnt do that and this should be called new chat history
        }

        socket.join(room);
        socket.to(room).emit("user joined", name);
    });
});

// Listen on port
http.listen(process.env.PORT || 3000, () => {
    console.log('Listening on Port 3000')
});