import os
import httpx
from fastapi import APIRouter, Query

router = APIRouter()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")


async def check_weather(client: httpx.AsyncClient, lat: float, lon: float):
    """Fetch weather from OpenWeatherMap and air quality from Google Air Quality API."""
    weather_resp = await client.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={"lat": lat, "lon": lon, "appid": OPENWEATHERMAP_API_KEY, "units": "imperial"}
    )
    weather_data = weather_resp.json()

    aqi_resp = await client.post(
        "https://airquality.googleapis.com/v1/currentConditions:lookup",
        params={"key": GOOGLE_MAPS_API_KEY},
        json={"location": {"latitude": lat, "longitude": lon}}
    )
    aqi_data = aqi_resp.json()

    # Prefer USA EPA index; fall back to the first available index
    indexes = aqi_data.get("indexes", [])
    aqi_index = next((i for i in indexes if i.get("code") == "usa_epa"), indexes[0] if indexes else {})

    return {
        "temperature": weather_data["main"]["temp"],
        "feels_like": weather_data["main"]["feels_like"],
        "humidity": weather_data["main"]["humidity"],
        "description": weather_data["weather"][0]["description"],
        "wind_speed": weather_data["wind"]["speed"],
        "aqi": aqi_index.get("aqi", 0),
        "aqi_category": aqi_index.get("category", "Unknown"),
        "dominant_pollutant": aqi_index.get("dominantPollutant")
    }


def get_walk_advisory(weather: dict, heat_sensitivity: str = "moderate"):
    """Generate walk recommendations based on weather and dog profile."""
    temp = weather["feels_like"]
    aqi = weather["aqi"]
    warnings = []
    walk_ok = True

    # Temperature checks
    if temp >= 90:
        warnings.append("Dangerously hot — pavement can burn paws. Walk early morning or late evening.")
        if heat_sensitivity == "high":
            warnings.append("This breed is especially heat-sensitive. Keep walks very short or skip.")
        walk_ok = False
    elif temp >= 80:
        warnings.append("Hot conditions — bring water and keep the walk short.")
        if heat_sensitivity == "high":
            warnings.append("This breed is heat-sensitive. Consider waiting for cooler temps.")
    elif temp <= 20:
        warnings.append("Very cold — short-coated or small dogs may need a jacket.")
        walk_ok = False
    elif temp <= 35:
        warnings.append("Cold out — watch for ice and salt on sidewalks.")

    # Air quality checks (EPA AQI: 0-50 good, 51-100 moderate, 101-150 sensitive, 151+ unhealthy)
    aqi_category = weather.get("aqi_category", "")
    if aqi > 150:
        warnings.append(f"Poor air quality ({aqi_category}) — avoid outdoor exercise.")
        walk_ok = False
    elif aqi > 100:
        warnings.append(f"Air quality is unhealthy for sensitive groups ({aqi_category}) — keep the walk short.")
        if heat_sensitivity == "high":
            walk_ok = False
    elif aqi > 50:
        warnings.append(f"Moderate air quality ({aqi_category}) — consider a shorter walk.")

    recommendation = "good_to_walk" if walk_ok else "not_recommended"

    return {
        "recommendation": recommendation,
        "warnings": warnings
    }


@router.get("/routes")
async def get_walking_route(
    origin_lat: float = Query(..., description="Starting point latitude"),
    origin_lng: float = Query(..., description="Starting point longitude"),
    distance_preference: str = Query("moderate", description="short, moderate, or long"),
    heat_sensitivity: str = Query("moderate", description="Dog's heat sensitivity: low, moderate, or high")
):
    radius_map = {
        "short": 800,
        "moderate": 1600,
        "long": 3200
    }
    radius = radius_map.get(distance_preference, 1600)

    async with httpx.AsyncClient() as client:
        # 1. Check weather first
        weather = await check_weather(client, origin_lat, origin_lng)
        advisory = get_walk_advisory(weather, heat_sensitivity)

        # 2. If conditions are bad, downgrade the walk distance
        if advisory["recommendation"] == "not_recommended":
            radius = radius_map["short"]

        # 3. Find a nearby park
        places_resp = await client.get(
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
            params={
                "location": f"{origin_lat},{origin_lng}",
                "radius": radius,
                "type": "park",
                "key": GOOGLE_MAPS_API_KEY
            }
        )
        places_data = places_resp.json()

        if not places_data.get("results"):
            return {"error": "No nearby parks found"}

        destination = places_data["results"][0]
        dest_lat = destination["geometry"]["location"]["lat"]
        dest_lng = destination["geometry"]["location"]["lng"]

        # 4. Get walking directions
        directions_resp = await client.get(
            "https://maps.googleapis.com/maps/api/directions/json",
            params={
                "origin": f"{origin_lat},{origin_lng}",
                "destination": f"{origin_lat},{origin_lng}",
                "waypoints": f"{dest_lat},{dest_lng}",
                "mode": "walking",
                "key": GOOGLE_MAPS_API_KEY
            }
        )
        directions_data = directions_resp.json()

    if not directions_data.get("routes"):
        return {"error": "Could not generate a walking route"}

    route = directions_data["routes"][0]

    return {
        "weather": weather,
        "advisory": advisory,
        "destination": {
            "name": destination.get("name"),
            "address": destination.get("vicinity"),
            "lat": dest_lat,
            "lng": dest_lng
        },
        "total_distance": route["legs"][0]["distance"]["text"],
        "total_duration": route["legs"][0]["duration"]["text"],
        "polyline": route["overview_polyline"]["points"],
        "steps": [
            {
                "instruction": step["html_instructions"],
                "distance": step["distance"]["text"],
                "duration": step["duration"]["text"]
            }
            for step in route["legs"][0]["steps"]
        ]
    }