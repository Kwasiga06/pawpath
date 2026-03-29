import os
import httpx
from fastapi import APIRouter, Query

router = APIRouter()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


@router.get("")
async def find_vets(address: str = Query(..., description="Address to search near")):
    async with httpx.AsyncClient() as client:
        # 1. Geocode the address to get lat/lng
        geo_resp = await client.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": address, "key": GOOGLE_MAPS_API_KEY}
        )
        geo_data = geo_resp.json()

        if not geo_data.get("results"):
            return []

        location = geo_data["results"][0]["geometry"]["location"]
        lat = location["lat"]
        lng = location["lng"]

        # 2. Search for nearby vets using Places API
        places_resp = await client.get(
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
            params={
                "location": f"{lat},{lng}",
                "radius": 5000,
                "type": "veterinary_care",
                "key": GOOGLE_MAPS_API_KEY
            }
        )
        places_data = places_resp.json()

        vets = []
        for place in places_data.get("results", [])[:10]:
            place_id = place.get("place_id")

            # 3. Get details (website) for each vet
            details_resp = await client.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                params={
                    "place_id": place_id,
                    "fields": "website",
                    "key": GOOGLE_MAPS_API_KEY
                }
            )
            details_data = details_resp.json()
            website = details_data.get("result", {}).get("website")

            open_now = place.get("opening_hours", {}).get("open_now", None)

            vets.append({
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "rating": place.get("rating"),
                "open_now": open_now,
                "website": website,
            })

        return vets
