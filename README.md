# CoCode 

**A Real-Time Collaborative Code Editor**

CoCode is a web-based collaborative coding platform that lets multiple developers write and edit code together in real time. Share a room, sync instantly, and code as a team — no matter where you are.

---

## Features

- **Real-Time Collaboration** — Multiple users can join a shared room and see each other's changes instantly
- **Room-Based Sessions** — Create or join a room using a unique room ID
- **Live Code Sync** — All edits are broadcast and synchronized across connected clients
- **Syntax Highlighting** — Clean, readable code editing experience
- **Responsive UI** — Works seamlessly in modern browsers

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, CSS |
| Backend | Node.js, Express.js |
| Real-Time Communication | Socket.IO |
| Package Manager | npm |

---

## Project Structure
```
CoCode/
├── backend/        # Node.js + Express server with Socket.IO
├── frontend/       # React.js client application
├── package.json    # Root dependencies
└── .gitignore
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/AnujPrakashDixit/CoCode.git
   cd CoCode
```

2. **Install root dependencies**
```bash
   npm install
```

3. **Install backend dependencies**
```bash
   cd backend
   npm install
```

4. **Install frontend dependencies**
```bash
   cd ../frontend
   npm install
```

### Running the App

1. **Start the backend server**
```bash
   cd backend
   npm start
```

2. **Start the frontend (in a new terminal)**
```bash
   cd frontend
   npm start
```

3. Open your browser and navigate to `http://localhost:3000`

---

## Usage

1. Open the app in your browser
2. Create a new room or enter an existing room ID
3. Share the room ID with your collaborators
4. Start coding together in real time!

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is open source. Feel free to use and modify it.

---

## 👤 Author

**Anuj Prakash Dixit**  
GitHub: [@AnujPrakashDixit](https://github.com/AnujPrakashDixit)
