const socket = io();
let typingTimeout;
let username = prompt('Enter your username:');
socket.emit('setUsername', username);

socket.on('updatePoll', (data) => {
    document.getElementById('poll-options').innerHTML = `
        Option 1: ${data.option1} votes<br>
        Option 2: ${data.option2} votes
    `;
});

socket.on('updateChat', (messages) => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = messages.map(msg => `<p>${msg}</p>`).join('');
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on('typing', (username) => {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.textContent = username ? `${username} is typing...` : '';
});

function vote(option) {
    socket.emit('vote', option);
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value;
    socket.emit('sendMessage', message);
    input.value = '';
}

socket.on('updateChat', (messages) => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = messages.map((msg, index) => `
        <p>${msg}
            <button onclick="editMessage(${index})">Edit</button>
            <button onclick="deleteMessage(${index})">Delete</button>
        </p>
    `).join('');
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

function editMessage(index) {
    const newMessage = prompt('Edit your message:');
    if (newMessage) {
        socket.emit('editMessage', index, newMessage);
    }
}

function deleteMessage(index) {
    if (confirm('Are you sure you want to delete this message?')) {
        socket.emit('deleteMessage', index);
    }
}

document.getElementById('message-input').addEventListener('input', () => {
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', false);
    }, 500);
});
