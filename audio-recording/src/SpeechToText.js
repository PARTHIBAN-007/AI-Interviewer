import { useState, useEffect } from "react";

const SpeechToText = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [fullTranscript, setFullTranscript] = useState("");

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome.");
    } else {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = true; // Keep listening until manually stopped
      speechRecognition.interimResults = true;
      speechRecognition.lang = "en-US";

      speechRecognition.onstart = () => {
        setIsListening(true);
        setFullTranscript(""); // Reset transcript on start
      };
      
      speechRecognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };
      
      speechRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
      
      speechRecognition.onend = () => {
        if (isListening) {
          speechRecognition.start(); // Restart recognition if manually stopped
        } else {
          setIsListening(false);
          setFullTranscript(text); // Store final transcription only after stopping
          console.log("Final Transcript:", text);
        }
      };
      
      setRecognition(speechRecognition);
    }
  }, [text, isListening]);

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      setIsListening(false);
      recognition.stop();
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Real-Time Speech to Text</h2>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-full text-white ${isListening ? "bg-red-500" : "bg-green-500"}`}
      >
        {isListening ? "🎙️ Stop Recording" : "🎤 Start Recording"}
      </button>
      <p className="mt-4 border p-2 min-h-[50px]">{fullTranscript || "Speak something..."}</p>
    </div>
  );
};

export default SpeechToText;
