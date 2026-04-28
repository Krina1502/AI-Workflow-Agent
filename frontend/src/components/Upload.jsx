import { useState } from "react";
import axios from "axios";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setStatus("");
    try {
      const res = await axios.post("http://localhost:8000/upload", formData);
      setStatus(`✅ ${res.data.message} — ${res.data.filename}`);
    } catch (e) {
      setStatus(`❌ ${e.response?.data?.detail || "Upload failed"}`);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>📂 Upload Document</h2>
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Processing..." : "Upload & Index"}
      </button>
      {status && <p className="status">{status}</p>}
    </div>
  );
}
