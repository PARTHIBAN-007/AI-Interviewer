import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function Chat() {
  const { state } = useLocation();
  const { role, topics } = state || { role: "Machine Learning Engineer", topics: [] };
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        audioChunksRef.current = [];
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    try {
      const response = await axios.post("http://localhost:8000/upload-audio/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.text) {
        setMessages([...messages, { type: "user", text: response.data.text }]);
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h2 className="text-2xl font-semibold text-center">Chat Interface</h2>
        <p className="text-center text-sm">Role: {role} | Topics: {topics.join(", ")}</p>
      </header>
      
      <div className="flex flex-row h-full w-full">
        <aside className="w-1/4 h-full bg-gray-800 p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Your Notes</h3>
          <textarea className="w-full bg-gray-700 border-gray-600 rounded p-2 h-48" placeholder="Write your notes..."></textarea>
          <button onClick={isRecording ? stopRecording : startRecording} className="w-full bg-blue-500 text-white py-2 mt-4 rounded-lg">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </aside>

        <section className="w-3/4 h-full p-6">
          <div className="h-full bg-gray-800 rounded-xl p-4 overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Transcription</h2>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.type === "user" ? "bg-blue-600 text-white" : "bg-gray-600"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Chat;
