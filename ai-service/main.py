from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import uvicorn

#used to access environment variables from .env file
import os

# Load environment variables from .env file
load_dotenv()

# Initialize fast api
app = FastAPI()

# Initialize Groq client
client=Groq(
    api_key=os.getenv("GROQ_API_KEY"),

)

# Request body model
class Emailrequest(BaseModel):
    emailContent:str

# Health check route
@app.get("/")
async def root():
    return{
        "message":"AI Email assistant Service Running"
    }


# AI reply generation route
@app.post("/generate_reply")
async def generate_reply(data:Emailrequest):
    
    try:
        completion=client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role":"system",
                    "content":(
                         "You are a professional AI email assistant. "
                        "Generate concise, professional, polite email replies."
                    )
                },
                {
                    "role":"user",
                    "content":f"Reply to this email:\n\n{data.emailContent}"
                }
            ],
            temperature=0.7,
            max_tokens=300
            )
        
        reply=completion.choices[0].message.content

        return {
            "success":True,
            "reply":reply
        }
    except Exception as e:
        return {
            "success":False,
            "error":str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)