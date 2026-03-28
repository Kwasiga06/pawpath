from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from routes.gemini import router as gemini_router


app = FastAPI(title="PawPath API")

app.include_router(gemini_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Paw Path is running!"}