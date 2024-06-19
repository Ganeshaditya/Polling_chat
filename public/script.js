const socket = io();
let typingTimeout;
let token;

const ctx = document.getElementById("voteChart").getContext("2d");

// Initialize the chart

const chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["perfomance"],
    },
    options: {

    }
});
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                token = data.token;
                socket.emit('authenticate', token);
                document.getElementById('auth').style.display = 'none';
                document.getElementById('poll').style.display = 'block';
                document.getElementById('chat').style.display = 'block';
            } else {
                alert('Login failed');
            }
        });
}

function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (response.status === 201) {
                alert('User registered, please login');
                showLogin();
            } else {
                alert('Signup failed');
            }
        });
}

function showSignup() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('signup').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup').style.display = 'none';
    document.getElementById('auth').style.display = 'block';
}

// On new vote update the chart
socket.on("updatePoll", (perfomance) => {

    // Convert the perfomance object into an array
    perfomance = Object.entries(perfomance);

    // For each candidate
    for (const [key, candidate] of perfomance) {

        // Update the vote if the user already exists if not create a new user and then update the vote
        if (typeof chart.data.datasets[key] == "undefined" && chart.data.datasets.length < perfomance.length) {
            chart.data.datasets.push({
                backgroundColor: candidate.color,
                borderColor: candidate.color,
                data: [candidate.votes],
                label: candidate.label
            });
        } else if (typeof chart.data.datasets[key] != "undefined") {
            chart.data.datasets[key].data = [candidate.votes];
        }

    }

    // Update the chart
    chart.update();
});

// Make a new vote (Remember this is not a safe way to do this)
function vote(index) {
    socket.emit("vote", index);
}




//chat
socket.on('updateChat', (messages) => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = messages.map(msg => `<p>${msg}</p>`).join('');
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on('typing', (username) => {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.textContent = username ? `${username} is typing...` : '';
});



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


// Get the input field
var input = document.getElementById("message-input");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("enterButton").click();
    }
});
