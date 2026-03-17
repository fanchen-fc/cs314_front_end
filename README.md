CS 314 Chat App - Frontend

FIRST STEP
    git clone https://github.com/fanchen-fc/cs314_front_end.git
    cd cs314_front_end

HOW TO RUN:

1. Install dependencies:
   npm install

2. Start the application:
   npm run dev

3. API Configuration:
   The backend URL is located in src/api.js 
   The app includes a header to skip the ngrok browser warning

FEATURES:
- User Login, Signup, and Logout
- Profile name updates
- Search for users by email or username
- Toggle between All Contacts and Recent Chats
- Real-time messaging with Socket.io
- Delete chat history
