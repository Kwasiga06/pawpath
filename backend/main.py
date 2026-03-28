from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from routes.gemini import router as gemini_router
from routes.walks import router as walks_router


app = FastAPI(title="PawPath API")

app.include_router(gemini_router, prefix="/api")
app.include_router(walks_router, prefix="/api/walks")


@app.get("/")
async def root():
    return {"message": "Paw Path is running!"}