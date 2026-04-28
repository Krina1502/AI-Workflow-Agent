import { useState } from "react";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("chat");

  return (
    <div className="app">
      <header>
        <h1>🤖 AI Workflow Agent</h1>
        <nav>
          {["chat", "dashboard"].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "chat" && <Chat />}
        {tab === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}
