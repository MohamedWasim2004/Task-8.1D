import { useState } from "react";
import { db, storage } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      let imageUrl = "";
      if (file) {
        const path = `uploads/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "posts"), {
        title,
        content,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setTitle(""); setContent(""); setTags(""); setFile(null);
      setMsg("✅ Post saved to Firestore (image uploaded to Storage).");
    } catch (err) {
      setMsg("❌ " + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{display:"grid", gap:12, maxWidth:720}}>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <textarea placeholder="Content" rows={5} value={content} onChange={e=>setContent(e.target.value)} required />
      <input placeholder="Tags (comma-separated)" value={tags} onChange={e=>setTags(e.target.value)} />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <button disabled={saving}>{saving ? "Saving..." : "Post"}</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
