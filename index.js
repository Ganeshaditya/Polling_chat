const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const User = require('./models/user');  // User model for authentication

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
//const performance = { option1: 0, option2: 0 };
const chatHistory = [];
const users = {};

// Check database connected or not
mongoose.connect(
  "mongodb+srv://saiganesh12798:45JicVztp7NAQTNj@cluster0.ri7hw63.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(()=>console.log('connected'))
.catch(e=>console.log(e));

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
});

app.post('/login', async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log(user);
    if (!user) {
        return res.status(400).send('Invalid username or password');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid username or password');
    }
    const token = jwt.sign({ userId: user.username }, 'secretkey');
    res.send({ token });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('authenticate', (token) => {
        try {
            const payload = jwt.verify(token, 'secretkey');
            users[socket.id] = payload.userId;
        } catch (e) {
            socket.disconnect();
        }
    });

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
        const [username] = chatHistory[index];
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
