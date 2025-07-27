import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

import Layout from "../components/Layout";

function HomeScreen({ enterRoom }) {
  const { setUser, setRoomKey, roomKey } = useChat();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [username, setUsername] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    setError('');
    const res = await fetch('http://localhost:5002/create-room', { method: 'POST' });
    const data = await res.json();
    setRoomKey(data.roomKey);
    setShowCreate(true);
  };

  const handleJoinRoom = async () => {
    if (!username || !roomInput) {
      setError('Username and Room Key required');
      return;
    }
    // Validate room key exists
    try {
      const res = await fetch(`http://localhost:5002/validate-room/${roomInput}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (!data.exists) {
        setError('Room key not found. The room may have expired or been deleted.\n\nRooms are deleted when all users leave. Please create a new room or check the key.');
        return;
      }
      setUser(username);
      setRoomKey(roomInput);
      enterRoom();
    } catch (e) {
      setError('Could not connect to server. Please check your connection or try again later.');
    }
  };

  return (
    <Layout>
      <section className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="bg-white/95 rounded-xl shadow-lg p-8 w-full">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center animate-fade-in">
            Join or Create a Room on AnonChat
          </h1>
          {/* Initial State: Show only buttons */}
          {!showCreate && !showJoin && (
            <>
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700 font-semibold shadow"
                onClick={handleCreateRoom}
              >
                Create Room
              </button>
              <button
                className="w-full bg-blue-700 text-white py-2 rounded-lg mb-4 hover:bg-blue-800 font-semibold shadow"
                onClick={() => setShowJoin(true)}
              >
                Join Room
              </button>
            </>
          )}

          {/* Create Room Flow */}
          {showCreate && !showJoin && (
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-blue-700 mb-2">Room Created!</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-lg font-mono bg-gray-100 rounded p-2 border inline-block select-all">{roomKey}</span>
                <button
                  className="p-2 rounded hover:bg-blue-100 text-blue-700"
                  title="Copy Room Key"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(roomKey);
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
                </button>
              </div>
              <input
                className="mt-4 w-full border rounded px-2 py-2 text-lg"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2 hover:bg-blue-700 font-semibold shadow"
                onClick={() => {
                  if (!username) {
                    setError('Username required');
                    return;
                  }
                  setUser(username);
                  enterRoom();
                }}
              >
                Enter Chat
              </button>
              <button
                className="w-full mt-2 text-blue-700 underline bg-transparent hover:bg-blue-50 rounded-lg"
                onClick={() => { setShowCreate(false); setUsername(''); setError(''); }}
                type="button"
              >
                Back
              </button>
            </div>
          )}

          {/* Join Room Flow */}
          {showJoin && !showCreate && (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-blue-700 mb-2">Join Existing Room</h2>
              <input
                className="w-full border rounded px-2 py-2 mb-2 text-lg"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                className="w-full border rounded px-2 py-2 mb-2 text-lg"
                placeholder="Enter room key"
                value={roomInput}
                onChange={e => setRoomInput(e.target.value)}
              />
              <button
                className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-semibold shadow"
                onClick={handleJoinRoom}
                type="button"
              >
                Join
              </button>
              <button
                className="w-full mt-2 text-blue-700 underline bg-transparent hover:bg-blue-50 rounded-lg"
                onClick={() => { setShowJoin(false); setUsername(''); setRoomInput(''); setError(''); }}
                type="button"
              >
                Back
              </button>
            </div>
          )}

          {error && <div className="text-red-500 mt-2 text-center font-medium">{error}</div>}
        </div>
      </section>
    </Layout>
  );
}


export default HomeScreen;
