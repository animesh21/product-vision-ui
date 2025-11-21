import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/api/generate-description";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [descriptions, setDescriptions] = useState([]);
  const [error, setError] = useState("");
  const [model, setModel] = useState("gpt-4o-mini")

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const setPresetPrompt = (type) => {
    if (type === "detail") {
      setPrompt("Describe this image in detail.");
    } else if (type === "objects") {
      setPrompt("What objects are present in this image?");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", imageFile);
    formData.append("model_name", model);

    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Request failed");
      }

      const data = await res.json();

      setDescriptions((prev) => [
        {
          id: Date.now(),
          text: data.description,
          model: data.model,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">ProductVision</div>
        <div className="status">
          <span className="dot" />
          Online | Ready
        </div>
      </header>

      <main className="layout">
        {/* LEFT: Upload + Prompt */}
        <section className="panel">
          <div
            className="upload-box"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="preview-image"
              />
            ) : (
              <div className="upload-placeholder">
                <p>Drag & drop your image here, or</p>
                <label className="upload-button">
                  Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              </div>
            )}
          </div>

          <form className="prompt-card" onSubmit={handleSubmit}>
            <label className="prompt-label">Prompt Input</label>
            <textarea
              className="prompt-input"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={500}
            />
            <div className="prompt-footer">
              <div className="preset-buttons">
                <button
                  type="button"
                  onClick={() => setPresetPrompt("detail")}
                >
                  Describe this image in detail
                </button>
                <button
                  type="button"
                  onClick={() => setPresetPrompt("objects")}
                >
                  What objects are in this image?
                </button>
              </div>
              <div className="char-count">{prompt.length} / 500</div>
            </div>
            <div className="model-selector">
              <label>Select Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                <option value="gpt-4.1">gpt-4.1</option>
                <option value="gpt-5-nano">gpt-5-nano</option>
                <option value="gpt-5-mini">gpt-5-mini</option>
                <option value="gpt-5.1">gpt-5.1</option>
              </select>
            </div>

            {error && <div className="error-text">{error}</div>}
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Description"}
            </button>
          </form>
        </section>

        {/* RIGHT: Generated Descriptions */}
        <section className="panel">
          <h2 className="panel-title">AI Generated Descriptions</h2>
          {descriptions.length === 0 && (
            <p className="empty-state">
              No descriptions yet. Upload an image and submit a prompt to
              get started.
            </p>
          )}
          <div className="description-list">
            {descriptions.map((item) => (
              <article key={item.id} className="description-card">
                <header className="description-header">
                  <div className="model-name">
                    {item.model || "Model"}
                  </div>
                  <div className="meta">
                    <span>{item.time}</span>
                  </div>
                </header>
                <p className="description-text">{item.text}</p>
                <footer className="description-footer">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(item.text)
                    }
                  >
                    Copy
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} ProductVision. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
