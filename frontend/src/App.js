import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import HomeScreen from './components/HomeScreen';
import ChatRoom from './components/ChatRoom';
import Home from './pages/Home';
import Contact from './pages/Contact';

function App() {
  const [inRoom, setInRoom] = useState(false);

  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={inRoom ? <ChatRoom exitRoom={() => setInRoom(false)} /> : <HomeScreen enterRoom={() => setInRoom(true)} />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
}

export default App;
