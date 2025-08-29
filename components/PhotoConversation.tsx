import React, { useRef, useState } from "react";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function PhotoConversation() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onPickFile() {
    fileRef.current?.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
    setMessages([]);
  }

  async function sendTurn(userText?: string) {
    if (!imageDataUrl) return;
    setLoading(true);
    const nextMessages = [...messages];
    if (userText && userText.trim()) nextMessages.push({ role: "user", content: userText.trim() });
    setMessages(nextMessages);

    const res = await fetch("/api/vision-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl, messages: nextMessages }),
    });
    const data = await res.json();
    setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    setLoading(false);
    setInput("");
  }

  async function finishNarrative() {
    setLoading(true);
    const res = await fetch("/api/narrative", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl, messages }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: `📝 Final narrative:\n\n${data.narrative}` }]);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
      {!imageDataUrl ? (
        <button onClick={onPickFile} className="px-4 py-2 rounded-2xl shadow">Upload a photo</button>
      ) : (
        <>
          <img src={imageDataUrl} alt="uploaded" className="w-full rounded-2xl shadow" />
          <div className="space-y-3 p-3 rounded-2xl bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "assistant" ? "text-gray-900" : "text-gray-700"}>
                <strong>{m.role === "assistant" ? "Photobot" : "You"}:</strong> {m.content}
              </div>
            ))}
            {messages.length === 0 && (
              <button
                className="px-3 py-2 rounded-2xl shadow"
                onClick={() => sendTurn()}
                disabled={loading}
              >
                Start the conversation
              </button>
            )}
            {messages.length > 0 && (
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendTurn(input)}
                  placeholder="Type your answer…"
                  className="flex-1 px-3 py-2 rounded-2xl border"
                />
                <button onClick={() => sendTurn(input)} className="px-4 py-2 rounded-2xl shadow" disabled={loading}>
                  Send
                </button>
                <button onClick={finishNarrative} className="px-4 py-2 rounded-2xl shadow" disabled={loading}>
                  Finish narrative
                </button>
              </div>
            )}
            {loading && <div>Thinking…</div>}
          </div>
        </>
      )}
    </div>
  );
}
