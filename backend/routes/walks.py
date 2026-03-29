import os
import json
import httpx
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from google import genai
from google.genai import types

router = APIRouter()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_CLIENT = None

def get_gemini_client():
    global GEMINI_CLIENT
    if GEMINI_CLIENT is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        GEMINI_CLIENT = genai.Client(api_key=api_key)
    return GEMINI_CLIENT


@router.get("/recommendations")
async def get_walk_recommendations(
    breed: str = Query(...),
    temp: Optional[float] = Query(None),
    condition: Optional[str] = Query(None),
    aqi: Optional[int] = Query(None),
):
    client = get_gemini_client()

    weather_context = (
        f"Current conditions: {temp}°F, {condition}, AQI {aqi}. Adjust recommendations accordingly."
        if temp is not None and condition is not None and aqi is not None
        else "No weather data — base recommendations on breed's typical needs only."
    )

    prompt = f"""You are a canine exercise expert. Generate walk recommendations for a {breed}.
{weather_context}

Return ONLY JSON with exactly these fields:
{{
  "duration": <integer minutes>,
  "distance": <float miles, one decimal>,
  "intensity": <"Low"|"Low-Moderate"|"Moderate"|"High"|"Very High">,
  "tips": [<3 concise actionable strings specific to this breed and conditions>],
  "best_time": <short time of day string>
}}"""

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")


async def check_weather(client: httpx.AsyncClient, lat: float, lon: float):
    weather = {
        "temperature": None,
        "feels_like": None,
        "humidity": None,
        "description": None,
        "wind_speed": None,
        "aqi": None,
        "aqi_category": None,
        "dominant_pollutant": None,
    }

    try:
        weather_resp = await client.get(
            "https://weather.googleapis.com/v1/currentConditions:lookup",
            params={
                "key": GOOGLE_MAPS_API_KEY,
                "location.latitude": lat,
                "location.longitude": lon,
                "unitsSystem": "IMPERIAL",
            }
        )
        wd = weather_resp.json()
        if "error" not in wd:
            weather["temperature"] = wd.get("temperature", {}).get("degrees")
            weather["feels_like"] = wd.get("feelsLikeTemperature", {}).get("degrees")
            weather["humidity"] = wd.get("relativeHumidity")
            weather["description"] = wd.get("weatherCondition", {}).get("description", {}).get("text")
            weather["wind_speed"] = wd.get("wind", {}).get("speed", {}).get("value")
    except Exception:
        pass

    try:
        aqi_resp = await client.post(
            "https://airquality.googleapis.com/v1/currentConditions:lookup",
            params={"key": GOOGLE_MAPS_API_KEY},
            json={"location": {"latitude": lat, "longitude": lon}}
        )
        aqi_data = aqi_resp.json()
        indexes = aqi_data.get("indexes", [])
        aqi_index = next((i for i in indexes if i.get("code") == "usa_epa"), indexes[0] if indexes else {})
        weather["aqi"] = aqi_index.get("aqi")
        weather["aqi_category"] = aqi_index.get("category")
        weather["dominant_pollutant"] = aqi_index.get("dominantPollutant")
    except Exception:
        pass

    return weather


async def find_nearby_parks(client: httpx.AsyncClient, lat: float, lon: float, radius: int):
    places_resp = await client.get(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        params={
            "location": f"{lat},{lon}",
            "radius": radius,
            "type": "park",
            "key": GOOGLE_MAPS_API_KEY,
        }
    )
    parks = []
    for place in places_resp.json().get("results", [])[:5]:
        parks.append({
            "name": place.get("name"),
            "address": place.get("vicinity"),
            "lat": place["geometry"]["location"]["lat"],
            "lng": place["geometry"]["location"]["lng"],
            "rating": place.get("rating"),
        })
    return parks


def compute_walk_score(weather: dict) -> int:
    """Return a 0–100 walk score from current weather and AQI data."""
    score = 100

    temp = weather.get("feels_like") or weather.get("temperature")
    if temp is not None:
        if temp < 20:
            score -= 40
        elif temp < 32:
            score -= 20
        elif temp < 45:
            score -= 5
        elif temp <= 75:
            pass  # ideal range
        elif temp <= 85:
            score -= 10
        elif temp <= 95:
            score -= 25
        else:
            score -= 45

    humidity = weather.get("humidity")
    if humidity is not None:
        if humidity > 90:
            score -= 15
        elif humidity > 75:
            score -= 8

    wind = weather.get("wind_speed")
    if wind is not None:
        if wind > 30:
            score -= 20
        elif wind > 20:
            score -= 10
        elif wind > 15:
            score -= 5

    aqi = weather.get("aqi")
    if aqi is not None:
        if aqi > 200:
            score -= 50
        elif aqi > 150:
            score -= 35
        elif aqi > 100:
            score -= 20
        elif aqi > 50:
            score -= 8

    desc = (weather.get("description") or "").lower()
    if any(w in desc for w in ("thunder", "storm", "tornado", "hurricane")):
        score -= 40
    elif any(w in desc for w in ("rain", "drizzle", "shower", "sleet", "snow", "hail", "blizzard", "freezing")):
        score -= 15
    elif any(w in desc for w in ("fog", "mist", "smoke", "haze", "dust")):
        score -= 8

    return max(0, min(100, score))


async def select_park_with_gemini(weather: dict, parks: list, heat_sensitivity: str, target_duration_mins: int):
    prompt = f"""
You are a dog walking assistant. Based on current weather and air quality conditions, select
the best nearby park for a dog walk and provide safety guidance.

Current conditions:
- Temperature: {f"{weather.get('temperature')}°F (feels like {weather.get('feels_like')}°F)" if weather.get('temperature') is not None else 'unavailable'}
- Weather: {weather.get('description') or 'unavailable'}
- Humidity: {f"{weather.get('humidity')}%" if weather.get('humidity') is not None else 'unavailable'}
- Wind: {f"{weather.get('wind_speed')} mph" if weather.get('wind_speed') is not None else 'unavailable'}
- AQI: {f"{weather.get('aqi')} ({weather.get('aqi_category')})" if weather.get('aqi') is not None else 'unavailable'}
- Dominant pollutant: {weather.get('dominant_pollutant') or 'unavailable'}

Dog profile:
- Heat sensitivity: {heat_sensitivity} (low = tolerates heat, high = very heat-sensitive)
- Target walk duration: {target_duration_mins} minutes total (round trip loop)

Nearby parks:
{json.dumps(parks, indent=2)}

AQI scale: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for sensitive groups, 151+ Unhealthy.

Return JSON:
{{
  "selected_park_index": <0-based index>,
  "recommendation": "good_to_walk" | "caution" | "not_recommended",
  "warnings": ["<specific warning if any>"],
  "walk_tips": ["<1-2 short tips tailored to today's conditions>"]
}}

Pick the best park for the conditions (e.g. shaded areas in heat, avoid exposed spots in high wind).
Only add warnings if conditions actually warrant it.
"""
    client = get_gemini_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt],
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    return json.loads(response.text)


async def compute_route(client: httpx.AsyncClient, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float):
    """Compute a loop walk: origin → park → origin."""
    route_resp = await client.post(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        headers={
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
        json={
            "origin": {
                "location": {"latLng": {"latitude": origin_lat, "longitude": origin_lng}}
            },
            "destination": {
                "location": {"latLng": {"latitude": origin_lat, "longitude": origin_lng}}
            },
            "intermediates": [
                {"location": {"latLng": {"latitude": dest_lat, "longitude": dest_lng}}}
            ],
            "travelMode": "WALK",
            "languageCode": "en-US",
            "units": "IMPERIAL",
        }
    )
    return route_resp.json()


@router.get("/routes")
async def get_walking_route(
    origin_lat: float = Query(...),
    origin_lng: float = Query(...),
    target_duration_mins: int = Query(30, description="Target total loop walk duration in minutes"),
    heat_sensitivity: str = Query("moderate", description="low, moderate, or high"),
):
    # Walking speed ~80 m/min. The loop is there-and-back, so the park
    # needs to be ~half the target duration away.
    one_way_mins = target_duration_mins / 2
    radius = max(400, min(int(one_way_mins * 80), 4000))

    async with httpx.AsyncClient() as client:
        # 1. Weather + AQI
        weather = await check_weather(client, origin_lat, origin_lng)

        # 2. Nearby parks
        parks = await find_nearby_parks(client, origin_lat, origin_lng, radius)
        if not parks:
            return {"error": "No nearby parks found"}

        # 3. Gemini selects best park and generates advisory
        gemini_result = await select_park_with_gemini(weather, parks, heat_sensitivity, target_duration_mins)

        selected_idx = min(gemini_result.get("selected_park_index", 0), len(parks) - 1)
        destination = parks[selected_idx]

        # 4. Routes API v2 for walking directions
        route_data = await compute_route(client, origin_lat, origin_lng, destination["lat"], destination["lng"])

    routes = route_data.get("routes", [])
    if not routes:
        return {"error": "Could not generate a walking route"}

    route = routes[0]
    distance_m = route.get("distanceMeters", 0)
    # Duration comes back as e.g. "342s"
    duration_s = int(route.get("duration", "0s").rstrip("s"))

    distance_miles = round(distance_m / 1609.34, 1)
    duration_mins = round(duration_s / 60)

    walk_score = compute_walk_score(weather)

    return {
        "walk_score": walk_score,
        "weather": weather,
        "advisory": {
            "recommendation": gemini_result.get("recommendation", "good_to_walk"),
            "warnings": gemini_result.get("warnings", []),
            "walk_tips": gemini_result.get("walk_tips", []),
        },
        "destination": {
            "name": destination["name"],
            "address": destination["address"],
            "lat": destination["lat"],
            "lng": destination["lng"],
        },
        "total_distance": f"{distance_miles} mi",
        "total_duration": f"{duration_mins} mins",
        "polyline": route.get("polyline", {}).get("encodedPolyline", ""),
    }
