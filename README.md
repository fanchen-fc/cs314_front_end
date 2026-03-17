CS 314 Chat App - Frontend

If you haven't already download the following:

   NodeJS https://nodejs.org/en/download
   VSCode(Or your preferred terminal) https://code.visualstudio.com/download

FIRST STEP
    git clone https://github.com/fanchen-fc/cs314_front_end.git
    cd cs314_front_end

HOW TO RUN:

1. Install dependencies:
   npm install

   If you get an error msg like "npm.ps1 cannot be loaded because running scripts is disabled on this system"
    Go into PowerShell as Administrator
    Run the command: Set-ExecutionPolicy RemoteSigned
    Restart VSCode then run npm install again
   
2. Start the application:
   npm run dev
   Put http:/localhost:5173/   into any browser with cookies enabled.
   
API Configuration:
   The backend URL is located in src/api.js 
   The app includes a header to skip the ngrok browser warning

FEATURES:
- User Login, Signup, and Logout
- Profile name updates
- Search for users by email or username
- Toggle between All Contacts and Recent Chats
- Real-time messaging with Socket.io
- Delete chat history
