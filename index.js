const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const performance = {
    "0": { votes: 0, label: "Bad", color: randomRGB() },
    "1": { votes: 0, label: "Not Bad", color: randomRGB() },
    "2": { votes: 0, label: "Good", color: randomRGB() },
    "3": { votes: 0, label: "Fine", color: randomRGB() },
    "4": { votes: 0, label: "Perfect", color: randomRGB() }
};

// Generate a random RGB color
function randomRGB() {
    const r = () => Math.random() * 256 >> 0;
    return `rgb(${r()}, ${r()}, ${r()})`;
}
const chatHistory = [];
const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('updatePoll', performance);
    socket.emit('updateChat', chatHistory);

    // On new vote
    socket.on("vote", (index) => {

        // Increase the vote at index
        if (performance[index]) {
            performance[index].votes += 1;
        }

        // Show the performance in the console for testing
        console.log(performance);

        // Tell everybody else about the new vote
        io.emit("updatePoll", performance);
    });

    // sending message
    socket.on('sendMessage', (message) => {
        const userMessage = `${users[socket.id]}: ${message}`;
        chatHistory.push(userMessage);
        io.emit('updateChat', chatHistory);
    });

    // setting user name for basic authentication for editing the messages
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

    // edit message
    socket.on('editMessage', (index, newMessage) => {
        const [username] = chatHistory[index].split(': ');
        if (username === users[socket.id]) {
            chatHistory[index] = `${username}: ${newMessage}`;
            io.emit('updateChat', chatHistory);
        }
    });

    // delete message
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
