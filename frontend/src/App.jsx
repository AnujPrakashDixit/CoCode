import { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react'

const socket = io("https://co-code-real-time-collaborative-ide.onrender.com");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write Your Code Here");
  const [copySucess, setCopySucess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");

  // --- Chat States ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)} is Typing...`);
      setTimeout(() => setTyping(""), 2000)
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output)
    });

    // --- Listen for Messages ---
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("receiveMessage"); // Cleanup
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, []);

  const joinRoom = () => {
    if (userName && roomId) {
      socket.emit("join", { roomId, userName })
      setJoined(true);
    }
  }

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// Write Your Code Here");
    setLanguage("javascript");
    setMessages([]); // Clear chat on leave
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySucess("Copied!");
    setTimeout(() => setCopySucess(""), 2000);
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName })
  }

  const handleLanguageChange = e => {
    const newLanguage = e.target.value
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  }

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
  }

  // --- Send Message Function ---
  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      const messageData = {
        roomId,
        userName,
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      socket.emit("sendMessage", messageData);
      setMessages((prev) => [...prev, messageData]); // Add own message to list
      setNewMessage("");
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") sendMessage();
  }

  if (!joined) {
    return <div className='join-container'>
      <div className="join-form">
        <h1>Join Co-Code</h1>
        <input type="text" placeholder='Enter the Room ID' value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <input type="text" placeholder='Enter Your Name' value={userName} onChange={(e) => setUserName(e.target.value)} />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  }

  return <div className="editor-container">
    <div className="sidebar">
      
      {/* 1. Room Info */}
      <div className="room-info">
        <h2>Code Room: {roomId}</h2>
        <button onClick={copyRoomId} className='copy-button'>Copy ID</button>
        {copySucess && <span className='copy-sucess'>{copySucess}</span>}
      </div>

      {/* 2. Users List (Scrollable now) */}
      <div className="users-list-section">
        <h3>Users</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.slice(0, 8)}</li>
          ))}
        </ul>
      </div>

      {/* 3. Typing Indicator */}
      <p className='typing-indicator'>{typing}</p>

      <select className='language-selector' value={language} onChange={handleLanguageChange}>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      {/* 4. Chat Section */}
      <div className="chat-container">
        <h3>Room Chat</h3>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.userName === userName ? 'my-message' : 'other-message'}`}>
              {msg.userName !== userName && <span className="chat-username">{msg.userName}</span>}
              <p>{msg.message}</p>
              <span className="chat-time">{msg.time}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
           <input 
              type="text" 
              placeholder="Type..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleEnterKey}
           />
           <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      <button className='leave-button' onClick={leaveRoom}>Leave Room</button>
    </div>

    <div className="editor-wrapper">
      <Editor
        height={"60%"}
        width={"100%"}
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme='vs-dark'
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
      <div className='btn-container'><button className='run-btn' onClick={runCode}>Execute</button></div>
      <textarea className='output-console' value={outPut} readOnly placeholder='Your output Will Appear Here ....' rows="10" cols="80"></textarea>
    </div>
  </div>
}

export default App
