from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.gemini import router as gemini_router
from routes.walks import router as walks_router
from routes.weather import router as weather_router
from routes.vets import router as vets_router


app = FastAPI(title="PawPath API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gemini_router, prefix="/api")
app.include_router(walks_router, prefix="/api/walks")
app.include_router(weather_router, prefix="/api/weather")
app.include_router(vets_router, prefix="/api/vets")


@app.get("/")
async def root():
    return {"message": "Paw Path is running!"}