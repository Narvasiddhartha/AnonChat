# Full-Stack Chat App (No DB)

## Features
- Create or join chat rooms by unique key
- Real-time chat with Socket.IO
- In-memory room/message storage (no DB)
- Clean UI with React + Tailwind CSS

## Getting Started

### Backend
```
cd backend
npm install
npm start
```

### Frontend
```
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Folder Structure
- `backend/`: Express + Socket.IO server
- `frontend/`: React app

---

## Notes
- Messages/rooms are destroyed when all users leave
- No persistent storage
