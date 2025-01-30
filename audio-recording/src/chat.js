import { useState } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [iter, setIter] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchMessage = async (responseText, iteration) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/llm_question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: responseText, iter: iteration }),
      });
      const data = await res.json();
      const message = data.response || "No response received";
      
      // Add message to chat
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
      setIter(iteration + 1);
      
      // Convert text to speech
      speakText(message);
    } catch (error) {
      console.error("Error fetching message:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to play the response as audio
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set language
      utterance.rate = 1; // Adjust speed if needed
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  };
  
  
  
  

  const handleStart = () => {
    setMessages([]);
    setIter(0);
    fetchMessage("", 0);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    fetchMessage(input, iter);
    setInput("");
  };

  return (
    <div className="flex flex-col max-w-md mx-auto p-4 border rounded shadow-md">
      <button
        onClick={handleStart}
        className="bg-blue-500 text-white p-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? "Loading..." : "Start"}
      </button>
      <div className="h-64 overflow-y-auto border p-2 mb-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded ${msg.role === "user" ? "bg-gray-200" : "bg-green-200"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type your response..."
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white p-2 rounded ml-2"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
