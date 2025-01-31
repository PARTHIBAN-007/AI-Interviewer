from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import io
import json
import whisper
from pydub import AudioSegment
from pydantic import BaseModel
from typing import List
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from llm import LLM_interviewer 
llm_instance = None
class UserPreferences(BaseModel):
    role: str
    topics: List[str]

@app.post("/config_question")
async def config_question(user_preferences: UserPreferences):
    role = user_preferences.role
    topics = user_preferences.topics
    global llm_instance
    llm_instance = LLM_interviewer(role,topics)
    llm_instance.llm_initialize()
    llm_instance.prompt_format()
    llm_instance.llm_config()
    return {"role":llm_instance.role, "topics": llm_instance.topics,"numQuestions":llm_instance.NQuestions}

class UserResponse(BaseModel):
    response : str
    iter : int

@app.post("/llm_question")
async def llm_question(user_response : UserResponse):
    print(user_response.iter)
    if user_response.iter==0:
        print("Welcome")
        prompt = llm_instance.llm_welcome_prompt_format()
        response = llm_instance.llm_qn_generate(prompt)
        llm_instance.LLMQuestions.append(response)
        return JSONResponse(content=json.loads(response))
    if user_response.iter>0 and user_response.iter<=llm_instance.CommunicationQns:
        print("Communication")
        llm_instance.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm_instance.responses()
        print(previous_question , answer_to_previous_answer)
        prompt = llm_instance.llm_intro_prompt_format(previous_question,answer_to_previous_answer)
        response = llm_instance.llm_qn_generate(prompt)
        llm_instance.LLMQuestions.append(response)
        return JSONResponse(content=json.loads(response))
    elif user_response.iter>llm_instance.CommunicationQns and user_response.iter<=llm_instance.NQuestions : 
        print("Questions")
        llm_instance.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm_instance.responses()
        difficulty = llm_instance.level()
        topic = llm_instance.interview_topic(user_response.iter)
        print(topic)
        prompt = llm_instance.llm_qn_prompt_format(previous_question,answer_to_previous_answer,topic,difficulty)
        response = llm_instance.llm_qn_generate(prompt)
        return JSONResponse(content=json.loads(response))
    else:
        print("Hello")
        llm_instance.UserResponses.append(user_response.response)
        print("hello")
        previous_question , answer_to_previous_answer = llm_instance.responses()
        print("hello")

        prompt = llm_instance.llm_conclusion_prompt_format(previous_question,answer_to_previous_answer)
        print("hello")
        response = llm_instance.llm_qn_generate(prompt)
        print(response)
        return JSONResponse(content=json.loads(response))
    
@app.post("/evaluate_responses")
async def evaluate_responses():
    prompt = llm_instance.evaluator_prompt_format()
    response = llm_instance.llm_qn_generate(prompt)
    return JSONResponse(content=json.loads(response))


        



        




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
