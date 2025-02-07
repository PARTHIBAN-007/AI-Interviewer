import os
from dotenv import load_dotenv
import google.generativeai as genai
import gTTS
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
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
def play_audio(text):
  tts = gTTS(text, lang="en")
  audio_file = "output.mp3"
  tts.save(audio_file)


    
    
        
    

from collections import defaultdict
question_topics = defaultdict(list)
question_topics["Data Analysis"].append((3,"hard"))
question_topics["Machine Learning"].append((5,"Easy"))
role = "Data Scientist"
import numpy as np

previous_questions = []
answer_to_previous_questions = []




def llm_question_generation(prompt):
    messages = [
        {"role": "user", "content": prompt}
    ]
    model = ChatGoogleGenerativeAI(model="gemini-pro",
                                temperature=0.3)
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)

    return chain
def generate_prompt(role, question_topics, previous_question, answer_to_previous_question,difficulty):
    prompt = prompt_template.format(
        role=role,
        question_topics=question_topics,
        previous_question=previous_question,
        answer_to_previous_question=answer_to_previous_question,
        difficulty = difficulty,
    )
    return prompt
def context_memory():
  if len(previous_questions)==0:

    previous_question = None
    answer_to_previous_question = None
    return previous_question ,answer_to_previous_question
  else:
    previous_question = previous_questions[-1]
    answer_to_previous_question = answer_to_previous_questions[-1]
    return previous_question ,answer_to_previous_question
cnt = 0
for topic in question_topics.keys():
  for _ in range(question_topics[topic][-1][0]):
    cnt+=1
    difficulty = question_topics[topic][-1][-1]
    print(cnt)
    previous_question ,answer_to_previous_question = context_memory()
    prompt = generate_prompt(role, topic, previous_question, answer_to_previous_question,difficulty)
    question = llm_question_generation(prompt)
    previous_questions.append(question)
    play_audio(question)
    answers = "Contextual bandits are a reinforcement learning framework used in real-time, personalized recommendations, where decisions are made based on user context (e.g., preferences, behavior) to maximize rewards (e.g., clicks or purchases). The exploration vs. exploitation trade-off is handled using strategies like epsilon-greedy (randomly exploring a fraction of the time), Upper Confidence Bound (UCB) (choosing actions with high uncertainty), or Thompson Sampling (balancing uncertainty probabilistically) to optimize long-term user engagement."
    answer_to_previous_questions.append(answers)



from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os

app = FastAPI()
model = whisper.load_model("base")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(await file.read())
        temp_audio_path = temp_audio.name

    # Transcribe the audio file
    result = model.transcribe(temp_audio_path)
    
    # Delete temporary file
    os.remove(temp_audio_path)

    return {"transcription": result["text"]}