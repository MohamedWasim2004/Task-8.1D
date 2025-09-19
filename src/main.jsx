import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";

// Pages
import PostPage from "./pages/PostPage.jsx";
import FindQuestions from "./pages/FindQuestions.jsx";

function Home() {
  return <p>Welcome — use the links above.</p>;
}

function NotFound() {
  return <p>404 — Page not found.</p>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<PostPage />} />
          <Route path="/find-questions" element={<FindQuestions />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
