from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import io
import whisper
from pydub import AudioSegment

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("base.en")  

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    audio_buffer = io.BytesIO(audio_bytes)
    
    try:
        audio = AudioSegment.from_file(audio_buffer)
        audio = audio.set_channels(1).set_frame_rate(16000)  
        audio_wav = io.BytesIO()
        audio.export(audio_wav, format="wav")
        audio_wav.seek(0)

        with open("temp_audio.wav", "wb") as temp_file:
            temp_file.write(audio_wav.read())

        result = model.transcribe("temp_audio.wav",language="en")
        text = result['text']

        return JSONResponse(content={"text": text})

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": f"An error occurred: {str(e)}"})

