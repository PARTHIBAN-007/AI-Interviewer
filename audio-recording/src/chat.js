import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [iter, setIter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const evaluationSent = useRef(false);

  // Extract data from location state
  const { topics, numQuestions, role } = location.state || { topics: [], numQuestions: 3, role: "Machine Learning Engineer" };

  useEffect(() => {
    if (numQuestions > 0 && topics.length > 0) {
      fetchMessage("", 0);
    }
  }, [numQuestions, topics]);

  const fetchMessage = async (responseText, iteration) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/llm_question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText, iter: iteration, topics }),
      });
  
      const data = await res.json();
      const message = data.response || "No response received";
  
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
      setIter(iteration + 1);
      console.log(iteration);
  
      // Check if iteration matches numQuestions + 1
      if (iteration === numQuestions+1) {
        setTimeout(() => navigate("/evaluation_page"), 10000);
      }
      
  
      speakText(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      setError("There was an issue fetching the response.");
    } finally {
      setLoading(false);
    }
  };
  
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    fetchMessage(input, iter);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Chat Interface</h1>

        {/* Chat Window */}
        <div className="h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 my-2 rounded-lg text-sm max-w-xs ${
                msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-gray-800 mr-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && <div className="text-red-600 text-center my-2">{error}</div>}

        {/* Input Area */}
        <div className="flex items-center mt-4 space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
