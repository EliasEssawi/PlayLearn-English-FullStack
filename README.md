ABOUT PROJECT:

WEBPROJECT – Full-Stack Web Application

WEBPROJECT is a full-stack web application developed by a team of four Software Engineering students at Braude College of Engineering.
The platform is designed to help children learn English in an interactive and engaging way, while allowing parents to monitor their progress.

The application is built with React on the client side and includes a secure, token-based authentication system.
It follows a modular, component-based architecture with continuous refactoring for scalability and maintainability.
Real-time features are a core part of the system, including WebSocket-based chat and peer-to-peer video calling (WebRTC) integrated into the children’s main page.

Note: You cannot run this project without environment variables.
Never commit your .env files or API keys.

Server (.env / production env vars)
MONGO_URI="mongodb+srv://...mongodb.net/PlayLearnEnglish?appName=Cluster0"
JWT_SECRET="your-secret"
NODE_ENV=production

OPENAI_API_KEY="your-key"
OPENAI_MODEL="gpt-4.1-mini"

RESEND_API_KEY="your-key"
MAIL_FROM="you@domain.com"

CLIENT_URL="https://webproject-coral.vercel.app"
APP_URL="https://your-backend.onrender.com"
MAX_ONLINE_USERS=20

Client (.env)
VITE_API_URL="https://your-backend.onrender.com"
VITE_SOCKET_URL="https://your-backend.onrender.com"

*If you use vercel/render these variables should be under "Environment Variables"
