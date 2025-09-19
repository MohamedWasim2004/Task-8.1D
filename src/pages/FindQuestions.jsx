import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";

export default function FindQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchTitle, setSearchTitle] = useState("");
  const [tag, setTag] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "questions"));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort(
        (a, b) => (b.date?.seconds ?? 0) - (a.date?.seconds ?? 0)
      );
      setQuestions(rows);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (
        searchTitle &&
        !q.title?.toLowerCase().includes(searchTitle.toLowerCase())
      )
        return false;
      if (tag && q.tag !== tag) return false;
      const when = q.date?.seconds ? new Date(q.date.seconds * 1000) : null;
      if (fromDate && when && when < new Date(fromDate)) return false;
      if (toDate && when && when > new Date(toDate)) return false;
      return true;
    });
  }, [questions, searchTitle, tag, fromDate, toDate]);

  async function handleAddSample() {
    const payload = {
      title: "Sample Question",
      description: "This is just a sample question.",
      tag: "demo",
      date: serverTimestamp(),
      details: "Extra details about the sample question.",
    };
    const ref = await addDoc(collection(db, "questions"), payload);
    setQuestions((prev) => [{ id: ref.id, ...payload }, ...prev]);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this question?")) return;
    await deleteDoc(doc(db, "questions", id));
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2>Find Questions</h2>

      {/* Filters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 160px 1fr 1fr auto",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <input
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          <option value="react">react</option>
          <option value="firebase">firebase</option>
          <option value="demo">demo</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button onClick={handleAddSample}>+ Add sample</button>
      </div>

      {/* List */}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              expanded={expandedId === q.id}
              onToggle={() =>
                setExpandedId(expandedId === q.id ? null : q.id)
              }
              onDelete={() => handleDelete(q.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, expanded, onToggle, onDelete }) {
  const when = q.date?.seconds ? new Date(q.date.seconds * 1000) : null;
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
        color: "#111",
      }}
    >
      <h3 style={{ margin: "0 0 6px" }}>{q.title}</h3>
      <p style={{ margin: "4px 0", color: "#444" }}>{q.description}</p>
      <small>
        Tag: {q.tag || "—"} | Date:{" "}
        {when ? format(when, "yyyy-MM-dd") : "—"}
      </small>
      {expanded && q.details && (
        <div style={{ marginTop: 8, background: "#f9f9f9", padding: 12 }}>
          <strong>Details:</strong>
          <p>{q.details}</p>
        </div>
      )}
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={onToggle}>{expanded ? "Collapse" : "Expand"}</button>
        <button onClick={onDelete} style={{ background: "#fee2e2" }}>
          Delete
        </button>
      </div>
    </div>
  );
}
