import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  ServerOff,
  KeyRound,
  Smile,
  ShieldCheck,
  UserCircle,
  Activity,
  Timer,
  Smartphone,
  EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      <section className="w-full py-16 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6">
          {/* Hero Card */}
          <div className="flex-1 bg-white rounded-3xl shadow-2xl p-10 flex flex-col gap-6 min-w-[300px] border border-gray-100">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">Chat with<br />your friends</h1>
            <p className="text-lg text-gray-800">No database. No chat storage. Anyone can chat, anytime.<br />Jump in instantly—no registration needed.</p>
            <Link to="/chat">
              <button className="mt-2 px-6 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-lg shadow transition">Get Started</button>
            </Link>
          </div>
          {/* Hero Illustration */}
          <div className="flex-1 flex justify-center items-center">
            <svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="320" height="200" rx="28" fill="#fff" />
              <rect x="24" y="32" width="120" height="16" rx="8" fill="#1e3a8a" />
              <rect x="24" y="60" width="80" height="16" rx="8" fill="#e5e7eb" />
              <rect x="24" y="88" width="180" height="16" rx="8" fill="#1e3a8a" />
              <circle cx="260" cy="40" r="14" fill="#1e3a8a" />
              <circle cx="260" cy="80" r="14" fill="#1e3a8a" />
              <rect x="24" y="116" width="150" height="16" rx="8" fill="#e5e7eb" />
              <circle cx="260" cy="120" r="14" fill="#e5e7eb" />
              <rect x="24" y="144" width="120" height="16" rx="8" fill="#1e3a8a" />
              <rect x="160" y="144" width="80" height="16" rx="8" fill="#e5e7eb" />
              <circle cx="260" cy="160" r="14" fill="#1e3a8a" />
              <rect x="24" y="144" width="120" height="16" rx="8" fill="#a3bffa" />
              <rect x="160" y="144" width="80" height="16" rx="8" fill="#e0e7ef" />
              <circle cx="260" cy="160" r="14" fill="#a3bffa" />
            </svg>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="w-full bg-gray-50 py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <ServerOff className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>No Database</CardTitle>
              </CardHeader>
              <CardContent>
                All chat data is stored in-memory. When everyone leaves, the room and messages are gone forever. No storage, no tracking.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <KeyRound className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Instant Join</CardTitle>
              </CardHeader>
              <CardContent>
                Join or create a room instantly with a unique key. No registration or login required—just start chatting.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <Smile className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Emoji Picker</CardTitle>
              </CardHeader>
              <CardContent>
                Express yourself with unlimited emoji selection, just like WhatsApp. Emojis work for all users.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <ShieldCheck className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Admin Controls</CardTitle>
              </CardHeader>
              <CardContent>
                Room creator is admin and can remove users. Admin rights transfer automatically if admin leaves.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <UserCircle className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>User Avatars</CardTitle>
              </CardHeader>
              <CardContent>
                Each user gets a random avatar color and initials, making it easy to identify everyone in the chat.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <Activity className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Typing Indicator</CardTitle>
              </CardHeader>
              <CardContent>
                See when someone is typing in real time, just like modern messaging apps.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <Timer className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Session Timer</CardTitle>
              </CardHeader>
              <CardContent>
                Track how long your chat room has been active with a live session timer.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <Smartphone className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Mobile-First & Modern UI</CardTitle>
              </CardHeader>
              <CardContent>
                Fully responsive, swipe gestures, and a clean SaaS look. Built with React, Tailwind, and Shadcn UI.
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center">
                <EyeOff className="w-8 h-8 text-blue-700 mb-2" />
                <CardTitle>Privacy & Ephemerality</CardTitle>
              </CardHeader>
              <CardContent>
                No chat logs, no persistent storage, no tracking. Your conversations disappear when the room is empty.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Developer Credit */}
      <footer className="w-full py-6 bg-transparent mt-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-500 text-sm">
          Developed by <a href="https://narvasiddhartha.me/" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline">Narva Siddhartha</a>
        </div>
      </footer>
    </Layout>
  );
}
