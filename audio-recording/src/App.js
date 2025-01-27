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
      // Get user media (microphone)
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
    <div className="h-screen bg-gray-500 flex flex-row p-4 ">
      <div className="w-1/4 h-screen flex justify-center  m-4 items-center bg-green-100 p-4 rounded-lg shadow-lg md:w-1/3 h-full relative">
        <div
          onClick={isRecording ? stopRecording : startRecording}
          className={`${
            isRecording ? 'animate-ping' : ''
          } p-5 rounded-full bg-red-600 text-white cursor-pointer shadow-lg hover:bg-red-700 transition-all  absolute`}
        >
          <i className="fas fa-microphone-alt text-4xl"></i>
        </div>
      </div>

      <div className="flex-1 h-screen p -20 m-4 max-w-lg bg-white p-6 rounded-lg shadow-lg overflow-y-auto h-full mt-8 md:mt-0">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transcription</h2>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
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

      
    </div>
  );
}

export default App;
