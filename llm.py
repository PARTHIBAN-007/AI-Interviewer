
import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
import random

class LLM_interviewer():
    def __init__(self,Role,Topics):
        self.role = Role
        self.topics = Topics
        self.NTQuestions = 2
        self.NTopics = len(Topics)
        self.NQuestions = self.NTQuestions * self.NTopics
        self.LLMQuestions = []
        self.difficulty = ["Easy","Medium","Hard"]
        self.UserResponses = []
        
    
    def llm_configure():
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            return 
        else:
            return "API Key is Not Found"
    def prompt_format(self):
        self.intro_prompt = '''you are an AI assistant designed to ask Questions about an aspirant for the {self.role}.
        previous question : {previous_question}
        user response : {user_response}
        If the user answer is not present then
        Ask questions about their introduction and the recent project that they worked and also ask questions about their profile
        Example output 1 :
        Great to have you here! Can you share your journey into data science and a project where you applied machine learning to solve a problem?
        Example Output 2 :
        Excited to meet you! Can you tell us about your experience with AI/ML and share a model you’ve developed or improved?
        if the user's is present ask questions relevant to the user' answers and Provide feedback to the user's previous answers and 
        if the user answer is off the topic kindly say feedback in a kind tone like "You are getting off the topic Let's Get into next Question"
        Example output 1 :
        Interesting! How did you evaluate the performance of your model, and what improvements did you make?
        Example 2 :
        That sounds like a solid system! How did you optimize database queries and API performance?
        ''' 

        self.interview_qn_format = '''You are an AI assistant designed to perform question generation for a mock interview of a "{self.role}".
        Kindly generate questions on "{question_topics}" with the difficulty level "{difficulty}"
        Only return the next question when prompted. Generate the  question now.
        Consider the response and the memory of the previous question if it is present.
        previous_question = "{previous_question}"
        answer_to_previous_question = "{user_response}"
        Example Output 1 :
            That is a solid use of machine learning! Your feature engineering strategy seems well thought out. 
            How did you determine which features were most impactful, and did you try any alternative approaches?
        Example output 2 :
            Great explanation of how you hadd apply linear regression! Your focus on feature selection is key. 
            In your opinion, how do you determine which variables are most influential in the model? Have you encountered any multicollinearity in your projects, and how did you address it?
        If the answer_to_previous_question is not present  or irrelevant to the question provide feedback in a nice tone.
        if its irrelevant to the topic kindly say feedback in a tone like "You are getting off the topic Let's Get into next Question"
        Example output 1 :
            It seems like there might have been a bit of confusion about the application of linear regression in this context. Let refocus on how you would use linear regression specifically for predicting housing prices.
            Can you share how you had approach selecting features and what variables you would consider for the model?
        Example Output 2 :
            It looks like there may have been a misunderstanding of the question. In linear regression, we typically interpret the coefficients as the impact each predictor has on the target variable.
            Could you give an example of how you'd interpret a coefficient in the context of a real-world dataset?
        '''   

    def llm_config(self):
        self.model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                generation_config={"response_mime_type":"application/json"}
                              )
        
class LLM_response(LLM_interviewer):
    super().__init__()
    def llm_intro_prompt_format(self,previous_question=None,user_response=None):
        prompt = self.intro_prompt.format(
            previous_question =previous_question,
            user_response = user_response
            )
        
        return prompt
    
    def llm_qn_prompt_format(self,previous_question=None,user_response=None,qn_topics = None , difficulty =str):
        prompt = self.intro_prompt.format(
            previous_question =previous_question,
            user_response = user_response
            question_topics = qn_topics,
            difficulty = difficulty
            )
        
        return prompt
    
    def llm_qn_generate(self,prompt):
        response = self.model.generate_content(prompt)
        return response.text
    
    def responses(self):
        if len(self.LLMQuestions)==0:
            previous_question = None
            answer_to_previous_question = None
            return previous_question , answer_to_previous_question
        else:
            previous_question = self.LLMQuestions[-1]
            answer_to_previous_question = self.UserResponses[-1]
            return previous_question , answer_to_previous_question
        
    def level(self):
        ind = random.randint(0,2)
        difficulty = self.difficulty[ind]
        return difficulty
      

    

        

        