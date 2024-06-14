# Real-time Polling and Chat Application

## Setup Instructions

1. Clone the repository:
    ```bash
    git clone <repository_url>
    cd real-time-polling-chat
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the application:
    ```bash
    npm start
    ```

4. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- `index.js`: Main server file.
- `public/`: Contains static files (HTML, CSS, JS).
- `public/index.html`: HTML file for the client-side interface.
- `public/styles.css`: CSS file for styling.
- `public/script.js`: JavaScript file for client-side logic.

## Features

- Real-time polling system.
- Real-time chat system.
- User authentication with usernames.
- Typing indicator.
- Edit and delete chat messages (optional).

## Technical Implementation

### Server-side
- **Express**: Serves static files.
- **Socket.IO**: Handles real-time communication.

### Client-side
- **HTML/CSS**: Interface layout and styling.
- **JavaScript**: Client-side logic for interacting with the server via WebSockets.

## Challenges and Solutions

- **Real-time Updates**: Ensured seamless real-time updates using Socket.IO.
- **User Management**: Implemented a basic user authentication system to associate usernames with chat messages.
- **Typing Indicator**: Added a typing indicator to enhance user experience.
- **Edit/Delete Messages**: (Optional) Added functionality to edit and delete messages.

## Future Enhancements

- Persistent user profiles and message history.
- Options to mute or disable chat notifications.
