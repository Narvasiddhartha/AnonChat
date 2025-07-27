import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import EmojiPicker from 'emoji-picker-react';
import { Users } from 'lucide-react';



import Layout from "./Layout";

function ChatRoom({ exitRoom }) {
  const socketRef = useRef();
  const { user, roomKey, setUser, setRoomKey } = useChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceMsg, setAnnounceMsg] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);
  const [userCount, setUserCount] = useState(1);
  const [users, setUsers] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const [mySocketId, setMySocketId] = useState(null);
  const [roomCreatedAt, setRoomCreatedAt] = useState(null);
  const [timer, setTimer] = useState('00:00:00');

  const messagesEndRef = useRef(null);

  const [exited, setExited] = useState(false);
  useEffect(() => {
    socketRef.current = io('http://localhost:5002');
    socketRef.current.on('connect', () => {
      setMySocketId(socketRef.current.id);
    });
    socketRef.current.emit('join_room', { username: user, roomKey });
    socketRef.current.on('chat_history', msgs => setMessages(msgs));
    socketRef.current.on('room_info', ({ createdAt }) => {
      setRoomCreatedAt(createdAt);
    });
    socketRef.current.on('receive_message', msg => setMessages(msgs => [...msgs, msg]));
    socketRef.current.on('announcement', ann => setMessages(msgs => [...msgs, ann]));
    socketRef.current.on('user_joined', ({ userCount }) => {
      setUserCount(userCount);
      playSound('join');
    });
    socketRef.current.on('user_left', ({ userCount }) => {
      setUserCount(userCount);
      playSound('leave');
    });
    socketRef.current.on('user_list', ({ users, adminId }) => {
      setUsers(users);
      setAdminId(adminId);
      console.log("User list received:", users);
    });
    // Typing indicator events
    socketRef.current.on('user_typing', ({ username }) => {
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
    });
    socketRef.current.on('user_stop_typing', ({ username }) => {
      setTypingUsers(prev => prev.filter(u => u !== username));
    });
    // Poll events

    socketRef.current.on('removed', ({ message }) => {
      setExited(true);
      alert(message);
      setUser(null);
      setRoomKey(null);
      exitRoom();
    });
    // Prevent refresh/close from exiting the group
    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { roomKey, username: user });
        socketRef.current.disconnect();
      }
    };
  }, [roomKey, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Session timer
  useEffect(() => {
    if (!roomCreatedAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - roomCreatedAt;
      const h = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [roomCreatedAt]);

  const sendMessage = e => {
    e.preventDefault();
    if (!input.trim()) return;
    socketRef.current.emit('send_message', { roomKey, username: user, message: input });
    setInput('');
    socketRef.current.emit('stop_typing', { roomKey, username: user });
  };

  // Handle typing
  const handleInputChange = e => {
    setInput(e.target.value);
    if (e.target.value.trim()) {
      socketRef.current.emit('typing', { roomKey, username: user });
    } else {
      socketRef.current.emit('stop_typing', { roomKey, username: user });
    }
  };

  // Admin sends announcement
  const sendAnnouncement = () => {
    if (!announceMsg.trim()) return;
    socketRef.current.emit('send_announcement', { roomKey, message: announceMsg });
    setAnnounceMsg('');
    setShowAnnounce(false);
  };

  const handleExit = () => {
    setUser(null);
    setRoomKey(null);
    exitRoom();
  };

  // Sound effects
  const playSound = (type) => {
    // Use short, reliable, license-free MP3s
    const url = type === 'join'
      ? 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c7a.mp3' // soft pop-in
      : 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c7a.mp3'; // same as join for subtlety
    try {
      const audio = new window.Audio(url);
      audio.volume = 0.2;
      audio.play().catch(() => {/* ignore playback errors */});
    } catch (e) {
      // fail silently
    }
  };


  // Swipe for user list (mobile)
  useEffect(() => {
    let startX = null;
    const onTouchStart = e => { startX = e.touches[0].clientX; };
    const onTouchEnd = e => {
      if (startX !== null && e.changedTouches[0].clientX - startX > 80) setShowUsers(true);
      startX = null;
    };
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f5f6fa]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-gray-200">
        <div className="font-bold text-lg md:text-xl flex items-center gap-3 text-gray-800">
          <span>Room: <span className="font-mono bg-gray-100 px-2 py-1 rounded select-all">{roomKey}</span> <span className="ml-2 text-xs text-orange-600 font-semibold">(Do not refresh the page)</span>{exited && <span className="ml-2 text-xs text-red-600 font-semibold">(You have exited the group)</span>}</span>
          <span className="ml-4 text-xs text-blue-700 font-semibold bg-blue-50 rounded px-2 py-1">Session: {timer}</span>
          <button
            className="p-1 rounded hover:bg-gray-200 text-gray-600"
            title="Copy Room Key"
            type="button"
            onClick={() => navigator.clipboard.writeText(roomKey)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          {adminId === mySocketId && (
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm font-semibold mr-2"
              onClick={() => setShowAnnounce(true)}
            >Announcement</Button>
          )}
          <button
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm shadow"
            onClick={() => setShowUsers(v => !v)}
            title="Show online users"
            type="button"
          >
            <Users className="w-5 h-5 text-blue-700" />
            <span>{userCount}</span>
          </button>
          <Button onClick={handleExit} className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Exit</Button>
        </div>
      </div>

      {/* Online Users Modal/Dropdown */}
      {showUsers && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowUsers(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 min-w-[300px] w-full max-w-xs relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Online Users</h2>
            <ul className="flex flex-col gap-2">
              {console.log('Modal users:', users)}
              {users.length === 0 && <li className="text-gray-500 italic">No users online.</li>}
              {users.map(u => (
                <li key={u.id} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-base shadow" style={{background:u.avatarColor}}>{u.initials}</span>
                    <span className="font-medium text-gray-800">{u.username}{u.id === adminId && <span className="ml-2 text-xs text-blue-700 font-bold">(admin)</span>}</span>
                  </div>
                  {adminId === mySocketId && u.id !== mySocketId && (
                    <button
                      className="ml-2 px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold"
                      onClick={() => socketRef.current.emit('remove_user', { roomKey, targetId: u.id })}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))} 
            </ul>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowUsers(false)}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-y-auto px-2 py-4 md:px-16 md:py-8 gap-2 bg-[#f5f6fa]">
        {messages.map((msg, idx) => (
          msg.type === 'system' ? (
            <div key={idx} className="text-center text-gray-500 italic text-xs my-2 tracking-wide bg-white/80 rounded-full px-3 py-1 mx-auto w-fit shadow-sm">
              {msg.message} <span className="ml-2 text-[10px] text-gray-400">{msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : msg.type === 'announcement' ? (
            <div key={idx} className="text-center text-blue-800 font-bold bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 my-2 mx-auto w-fit shadow">
              📢 {msg.message}
              <span className="ml-2 text-xs text-blue-600 font-semibold">(Announcement)</span>
              <span className="ml-2 text-[10px] text-blue-400">{msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : (
            <div
              key={idx}
              className={`flex items-end gap-2 ${msg.username === user ? 'justify-end' : 'justify-start'}`}
            >
              {msg.username !== user && (
                (() => {
                  const u = users.find(x => x.username === msg.username);
                  return (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm" style={{background:u?.avatarColor||'#aaa'}}>
                      {u?.initials || msg.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  );
                })()
              )} 
              <div className={`relative group rounded-2xl px-4 py-2 max-w-[65vw] md:max-w-[55%] break-words shadow-sm transition-all bg-white text-gray-800 mb-1 flex flex-col items-end`}
                style={{ wordBreak: 'break-word' }}>
                <span className="block font-semibold text-xs mb-1 opacity-70 text-gray-500 text-left w-full">
                  {msg.username}
                </span>
                <span className="block text-base leading-snug text-left w-full">{msg.message}</span>
                <span className="mt-1 text-[10px] text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity self-end">
                  {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {msg.username === user && (
                (() => {
                  const me = users.find(x => x.id === mySocketId);
                  return (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm" style={{background:me?.avatarColor||'#444'}}>
                      {me?.initials || user?.[0]?.toUpperCase() || '?'}
                    </div>
                  );
                })()
              )} 
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Row */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 p-4 bg-[#f7f7f7]  border-t border-[#ece5dd] relative ">
        {/* Emoji picker button always visible for all users */}
        <button
          type="button"
          className="p-2 rounded-full border-2 border-red-500 bg-yellow-200 hover:bg-yellow-300 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          style={{ fontSize: 22, zIndex: 1000 }}
          onClick={() => setShowEmoji(v => !v)}
          tabIndex={-1}
        >
          <span role="img" aria-label="emoji">😊</span>
        </button>
        {showEmoji && (
          <div className="absolute bottom-16 left-2 z-50">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                if (inputRef.current) {
                  const start = inputRef.current.selectionStart;
                  const end = inputRef.current.selectionEnd;
                  const newValue = input.slice(0, start) + emojiData.emoji + input.slice(end);
                  setInput(newValue);
                  setTimeout(() => {
                    inputRef.current.focus();
                    inputRef.current.selectionStart = inputRef.current.selectionEnd = start + emojiData.emoji.length;
                    // Fire synthetic input event so React sees the change and form can submit
                    const event = new Event('input', { bubbles: true });
                    inputRef.current.dispatchEvent(event);
                  }, 0);
                } else {
                  setInput(input => {
                    const val = input + emojiData.emoji;
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.value = val;
                        const event = new Event('input', { bubbles: true });
                        inputRef.current.dispatchEvent(event);
                      }
                    }, 0);
                    return val;
                  });
                }

              }}
              theme="light"
              width={320}
              height={380}
              searchDisabled={false}
              emojiStyle="native"
            />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-0 max-w-[90%] rounded-3xl border border-gray-300 dark:border-neutral-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25D366]   bg-white"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          autoFocus
          onBlur={()=>setTimeout(()=>setShowEmoji(false),200)}
        />
        <Button type="submit" className="bg-[#25D366] hover:bg-green-500 text-white px-6 py-2 rounded-3xl">Send</Button>
      </form>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 pb-2 text-sm text-blue-700 font-semibold animate-pulse flex items-center gap-2">
          <span className="inline-flex items-center">
            <svg className="w-5 h-5 mr-1 text-blue-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 15h8M8 11h8m-8-4h8" strokeLinecap="round"/></svg>
            <span>{typingUsers.join(', ')}</span>
          </span>
          <span>{typingUsers.length === 1 ? 'is typing...' : 'are typing...'}</span>
        </div>
      )}
      {/* Announcement Modal */}
      {showAnnounce && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAnnounce(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] w-full max-w-sm relative flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-blue-700 mb-2">Send Announcement</h2>
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              value={announceMsg}
              onChange={e => setAnnounceMsg(e.target.value)}
              placeholder="Type your announcement..."
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setShowAnnounce(false)} className="bg-gray-200 text-gray-700">Cancel</Button>
              <Button onClick={sendAnnouncement} className="bg-blue-700 text-white">Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
