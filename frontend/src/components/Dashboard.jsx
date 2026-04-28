import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium" });

  const fetchData = async () => {
    const [l, t] = await Promise.all([
      axios.get("http://localhost:8000/logs"),
      axios.get("http://localhost:8000/tickets"),
    ]);
    setLogs(l.data.logs);
    setTickets(t.data.tickets);
  };

  useEffect(() => { fetchData(); }, []);

  const createTicket = async () => {
    if (!form.subject.trim()) return;
    await axios.post("http://localhost:8000/tickets", form);
    setForm({ subject: "", description: "", priority: "medium" });
    fetchData();
  };

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>

      <h3>🎫 Create Support Ticket</h3>
      <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button onClick={createTicket}>Create Ticket</button>

      <h3>🎟 Tickets ({tickets.length})</h3>
      {tickets.map((t) => (
        <div key={t.id} className="log-item">
          <strong>[{t.priority.toUpperCase()}]</strong> {t.subject} — <em>{t.status}</em>
        </div>
      ))}

      <h3>🗂 Query Logs ({logs.length})</h3>
      {logs.map((l, i) => (
        <div key={i} className="log-item">
          <strong>Q:</strong> {l.query}<br />
          <strong>A:</strong> {l.answer}
        </div>
      ))}
    </div>
  );
}
