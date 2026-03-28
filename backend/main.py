from fastapi import FastAPI
from dotenv import load_dotenv

from routes.gemini import router as gemini_router

load_dotenv()


app = FastAPI(title="PawPath API")

app.include_router(gemini_router, prefix="/gemini")


@app.get("/")
async def root():
    return {"message": "Paw Path is running!"}