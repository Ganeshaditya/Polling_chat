const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const pollData = { option1: 0, option2: 0 };
const chatHistory = [];
const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('updatePoll', pollData);
    socket.emit('updateChat', chatHistory);

    socket.on('vote', (option) => {
        if (pollData[option] !== undefined) {
            pollData[option]++;
            io.emit('updatePoll', pollData);
        }
    });

    socket.on('sendMessage', (message) => {
        const userMessage = `${users[socket.id]}: ${message}`;
        chatHistory.push(userMessage);
        io.emit('updateChat', chatHistory);
    });

    socket.on('setUsername', (username) => {
        users[socket.id] = username;
    });

    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('typing', isTyping ? users[socket.id] : null);
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        console.log('User disconnected');
    });
    
    socket.on('editMessage', (index, newMessage) => {
        const [username] = chatHistory[index].split(': ');
        if (username === users[socket.id]) {
            chatHistory[index] = `${username}: ${newMessage}`;
            io.emit('updateChat', chatHistory);
        }
    });
    
    socket.on('deleteMessage', (index) => {
        const [username] = chatHistory[index].split(': ');
        if (username === users[socket.id]) {
            chatHistory.splice(index, 1);
            io.emit('updateChat', chatHistory);
        }
    });
    
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
