import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roomKey, setRoomKey] = useState(null);

  return (
    <ChatContext.Provider value={{ user, setUser, roomKey, setRoomKey }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
