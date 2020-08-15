console.log("Script loaded");

$(function () {
    const labelName = document.getElementById("labelName");

    const getUrlParams = () => {
        let urlString = window.location.href;
        let paramsStr = urlString.split("?")[1];
        let paramsArr = paramsStr.split("&");

        let name = paramsArr[0].split("=")[1];
        let room = paramsArr[1].split("=")[1];

        return {
            name: name,
            room: room
        }
    }

    var user = getUrlParams();
    var name = user.name;
    var msg = "";
    labelName.innerHTML = name;

    var socket = io();
    socket.emit('change room', user.room);

    socket.emit('request chat history update', user.room);

    const changeName = (arr) => {
        let oldName = name;
        console.log(`changing to: ${arr[1]}`)
        name = arr[1];
        systemMsg(`${oldName} changed there name to ${name}`);
        $('#inputMessage').val('');
        
        labelName.innerHTML = `${name}`;
    }

    const runCommand = (command) => {
        let commandArray = command.split(" ");
        
        switch(commandArray[0]){
            case "!cname":
                changeName(commandArray);
                return true;
            default:
                return false;
        }
    }

    const updateChatHistory = (history) => {
        for(var i = 0; i < history.length; i++){
            let content = `${history[i].name}: ${history[i].msg}`;
            $('#listMessages').append($('<li class="list-group-item">').text(content));
        }
    }

    const systemMsg = (text) => {
        socket.emit('chat message', {
            name: "System",
            msg: text
        });
    }

    $('form').submit(function(e){
        msg = $('#inputMessage').val();
        
        e.preventDefault(); // prevents page reloading
        
        if(!runCommand(msg)){
            socket.emit('chat message', {
                name: name,
                room: user.room,
                msg: $('#inputMessage').val()
            });
            $('#inputMessage').val('');
        }
        
        return false;
    });

    // Socket Recieving calls
    socket.on('client chat message', function(msg){
        let content = `${msg.name}: ${msg.msg}`;
        $('#listMessages').append($('<li class="list-group-item">').text(content));
    });

    socket.on('update chat history', (chatHistory) => {
        updateChatHistory(chatHistory);
    });
});