import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>DEV@Deakin</h1>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/post">Post</Link>
        <Link to="/find-questions">Find Question</Link>
      </nav>
      <Outlet />
    </div>
  );
}
