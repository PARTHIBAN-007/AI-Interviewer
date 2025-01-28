import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [messages, setMessages] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  // Start recording function
  const startRecording = async () => {
    if (isProcessing) {
      return;
    }

    setStatus('Accessing microphone...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        setStatus('Recording stopped. Sending to backend...');
        await sendAudioToBackend(audioBlobRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Recording...');
    } catch (error) {
      setStatus('Error accessing microphone.');
      console.error('Error accessing microphone: ', error);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing audio...');
    }
  };

  // Send the recorded audio to the backend
  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    try {
      const response = await axios.post('http://localhost:8000/upload-audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.text) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: response.data.text },
        ]);
      } else {
        setStatus('Error: No transcription received.');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      setStatus('Error sending audio to backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-100 font-sans h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <h2 className="text-3xl font-bold text-center">AI Interviewer</h2>
      </header>

      {/* Main Content */}
      <div className="flex flex-row h-full w-full">
        {/* Sidebar */}
        <aside className="w-1/4 h-full bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Your Notes</h3>
            <textarea
              className="w-full border border-gray-300 rounded p-2 h-48 resize-y focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Write your notes here..."
            ></textarea>
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="w-full bg-gray-800 text-white font-medium py-2 rounded-lg hover:bg-gray-700 transition"
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </aside>

        {/* Chat Area */}
        <section className="w-3/4 h-full bg-gray-50 p-6">
          <div className="h-full bg-white shadow-xl rounded-xl p-4 overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transcription</h2>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                    }`}
                  >
                    {message.text}
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

export default App;
