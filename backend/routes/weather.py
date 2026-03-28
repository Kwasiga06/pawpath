import os
import httpx
from fastapi import APIRouter, Query

router = APIRouter()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


@router.get("/current")
async def get_current_weather(lat: float = Query(...), lon: float = Query(...)):
    async with httpx.AsyncClient() as client:
        data = await check_weather(client, lat, lon)
    return data


async def check_weather(client: httpx.AsyncClient, lat: float, lon: float):
    """Fetch weather and air quality from Google APIs."""
    weather_resp = await client.get(
        "https://weather.googleapis.com/v1/currentConditions:lookup",
        params={
            "key": GOOGLE_MAPS_API_KEY,
            "location.latitude": lat,
            "location.longitude": lon,
            "unitsSystem": "IMPERIAL",
        }
    )
    weather_data = weather_resp.json()

    aqi_resp = await client.post(
        "https://airquality.googleapis.com/v1/currentConditions:lookup",
        params={"key": GOOGLE_MAPS_API_KEY},
        json={"location": {"latitude": lat, "longitude": lon}}
    )
    aqi_data = aqi_resp.json()

    indexes = aqi_data.get("indexes", [])
    aqi_index = next((i for i in indexes if i.get("code") == "usa_epa"), indexes[0] if indexes else {})

    return {
        "temperature": weather_data.get("temperature", {}).get("degrees"),
        "feels_like": weather_data.get("feelsLikeTemperature", {}).get("degrees"),
        "humidity": weather_data.get("relativeHumidity"),
        "description": weather_data.get("weatherCondition", {}).get("description", {}).get("text"),
        "wind_speed": weather_data.get("wind", {}).get("speed", {}).get("value"),
        "aqi": aqi_index.get("aqi", 0),
        "aqi_category": aqi_index.get("category", "Unknown"),
        "dominant_pollutant": aqi_index.get("dominantPollutant"),
    }
