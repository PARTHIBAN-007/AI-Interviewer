from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import io
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


from llm import LLM_interviewer ,LLM_response

class UserPreferences(BaseModel):
    role: str
    topics: List[str]

@app.post("/config_question")
async def config_question(user_preferences: UserPreferences):
    role = user_preferences.role
    topics = user_preferences.topics
    llm = LLM_interviewer(role,topics)
    return {"role":llm.role, "topics": llm.topics,"No of Questions":llm.NQuestions}

class UserResponse(BaseModel):
    response : str

@app.post("/llm_question")
async def llm_question(user_response : UserResponse):
    if user_response.response=="":
        llm = LLM_response()
        llm.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm.responses()
        prompt = llm.llm_intro_prompt_format(previous_question,answer_to_previous_answer)
        response = llm.llm_qn_generate(prompt)
        return response
    elif user_response.response is not None:
        llm = LLM_response()
        llm.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm.responses()
        prompt = llm.llm_qn_prompt_format(previous_question,answer_to_previous_answer,"ML","Easy")
        response = llm.llm_qn_generate(prompt)
        return response
        


