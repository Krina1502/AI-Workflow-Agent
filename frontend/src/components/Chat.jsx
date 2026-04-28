import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState("");
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post("http://localhost:8000/upload", formData);
      setUploaded(`✅ ${res.data.filename} ready — now ask your questions`);
    } catch (e) {
      setUploaded(`❌ ${e.response?.data?.detail || "Upload failed"}`);
    }
    setUploading(false);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const q = question;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/ask", { params: { question: q } });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "ai", text: "❌ Error getting answer." }]);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      {/* Upload section */}
      <h2>📂 Upload Document</h2>
      <div className="input-row">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Processing..." : "Upload"}
        </button>
      </div>
      {uploaded && <p className="status">{uploaded}</p>}

      <hr style={{ borderColor: "#333", margin: "8px 0" }} />

      {/* Chat section */}
      <h2>💬 Ask AI</h2>
      <div className="messages">
        {messages.length === 0 && (
          <p style={{ color: "#555", fontSize: "0.85rem" }}>Upload a PDF above, then ask anything about it.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span>{m.role === "user" ? "🧑" : "🤖"}</span> {m.text}
          </div>
        ))}
        {loading && <div className="message ai">🤖 Thinking...</div>}
      </div>
      <div className="input-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask something about your document..."
        />
        <button onClick={handleAsk} disabled={loading || !uploaded}>Ask</button>
      </div>
    </div>
  );
}
