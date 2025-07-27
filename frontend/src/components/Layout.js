import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50  transition-colors duration-500`}>
      <header className="sticky top-0 z-30 w-full bg-white/80 /90 backdrop-blur border-b border-blue-100  shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight flex items-center gap-2 animate-fade-in">
            <span className="">AnonChat</span>
          </Link>
          <nav className="flex gap-8 text-blue-700 font-medium text-lg">
            <Link className={pathname === "/" ? "underline" : "hover:underline"} to="/">Home</Link>
            <Link className={pathname === "/chat" ? "underline" : "hover:underline"} to="/chat">Chat</Link>
            <Link className={pathname === "/contact" ? "underline" : "hover:underline"} to="/contact">Contact</Link>
          </nav>
        </div>
      </header>
      <div className="w-full text-center mt-6 animate-fade-in">
        <div className="text-xl font-semibold text-gray-900">
          No database. No chat storage. Anyone can chat, anytime.
        </div>
      </div>
      <main className="flex-1 flex flex-col justify-center items-center px-2 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="w-full text-center py-6 text-gray-400 border-t border-blue-100 mt-8">
        &copy; {new Date().getFullYear()} AnonChat. All rights reserved.
      </footer>
      <style>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: left center; }
          50% { background-position: right center; }
        }
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: none; }
        }
        .animate-bounce {
          animation: bounce 1.2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
}
