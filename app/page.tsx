import "./globals.css";
import { useRef, useState } from "react";

export default function Page() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const promptRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function onAsk() {
    const prompt = promptRef.current?.value?.trim();
    if (!prompt || !imagePreview) {
      alert("Please choose an image and enter a question.");
      return;
    }
    setIsLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image: imagePreview })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAnswer(data.answer);
    } catch (e: any) {
      setAnswer("Error: " + (e?.message ?? "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  }

  function clearAll() {
    setImagePreview(null);
    setAnswer("");
    if (fileRef.current) fileRef.current.value = "";
    if (promptRef.current) promptRef.current.value = "";
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="h">Photobot</h1>
        <p className="p">Ask questions about a photo. No accounts, no clutter.</p>

        <div className="row" style={{ marginTop: 16 }}>
          <div>
            <div className="label">Photo</div>
            <input ref={fileRef} className="input" type="file" accept="image/*" onChange={onFile} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="label">Your question</div>
            <input ref={promptRef} className="input" placeholder="e.g. What's written on the sign?" />
          </div>
          <button className="btn" onClick={onAsk} disabled={isLoading}> {isLoading ? "Thinking…" : "Ask"} </button>
          <button className="btn" onClick={clearAll} disabled={isLoading}>Reset</button>
        </div>

        {imagePreview && (
          <>
            <hr />
            <img alt="preview" className="preview" src={imagePreview} />
          </>
        )}

        {answer && (
          <>
            <hr />
            <div className="answer">{answer}</div>
          </>
        )}
        <hr />
        <p className="small">Privacy: the image is sent to the serverless function for analysis. No database is used in this starter.</p>
      </div>
    </div>
  );
}