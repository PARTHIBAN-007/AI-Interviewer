import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [iter, setIter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get topics and number of questions from location state
  const { topics, numQuestions, role } = location.state || { topics: [], numQuestions: 3, role: "Machine Learning Engineer" };
  console.log(topics,numQuestions,role);

  // Send the first message (backend should send the first message)
  useEffect(() => {
    if (numQuestions > 0) {
      fetchMessage("", 0); // Fetch first message from backend
    }
  }, [numQuestions]);

  const fetchMessage = async (responseText, iteration) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/llm_question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: responseText, iter: iteration, topics }),
      });
      const data = await res.json();
      const message = data.response || "No response received";
      
      // Add message to chat
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
      setIter(iteration + 1);

      // Check if the iteration has reached numQuestions
      if (iteration === numQuestions+1) {
        // Final message from backend (to simulate the last response)
        const finalRes = await fetch("http://127.0.0.1:8000/evaluate_responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ iter: iteration }),
        });
        const finalData = await finalRes.json();
        console.log(finalData);

        // Wait for 10 seconds before redirecting
        setTimeout(() => {
          navigate("/evaluation_page");
        }, 10000); // 10 seconds delay
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; 
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  };

  const handleStart = () => {
    setMessages([]);
    setIter(0);
    setError(null);
    fetchMessage("", 0); // Send the first message from the backend
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    fetchMessage(input, iter);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-rich-black p-6">
      {/* Start Button */}
      <button
        onClick={handleStart}
        className="bg-green-300 text-black p-4 rounded-lg text-xl mb-6 w-full md:w-3/4 lg:w-1/2 shadow-lg hover:bg-phthalo-green/80 transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Loading..." : "Start Chat"}
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center w-full md:w-3/4 lg:w-1/2">
          {error}
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl p-6 shadow-lg mb-4 w-full md:w-3/4 lg:w-1/2 border border-gray-200">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 my-2 rounded-lg text-sm transition-all duration-300 ${
              msg.role === "user"
                ? "bg-light-malachite-green text-rich-black ml-auto max-w-xs"
                : "bg-gray-100 text-rich-black mr-auto max-w-xs"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-4 w-full md:w-3/4 lg:w-1/2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-phthalo-green text-rich-black placeholder-gray-400"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-green-300 text-white p-4 rounded-lg hover:bg-phthalo-green/80 transition-all duration-300"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
