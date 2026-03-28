import os

from fastapi import APIRouter, UploadFile, File


import google.generativeai as genai

router = APIRouter()

@router.post("/identify")

async def identify(file: UploadFile = File(...)):
    image_data = await file.read()
    model = genai.GenerativeModel("models/gemini-1.5-flash")

    prompt = """
    Analyze these dog photos and reutrn the following in JSON format:
    {"breed": "the identified breed",
    "size_category": "small', "medium, or  "large",
    "estimated-weight_lbs": estimated weight as a range,
    "estimated-age_years": estimated age as a range

    use the following categories for size_category:
    - small: 0-20 lbs
    - medium: 21-50 lbs
    - large: 51+ lbs

    Only return the JSON object, do not include any additional text.
    }
    
    """

    response = model.generate_content([
        prompt,
        {"mime_type": file.content_type, "data": image_data}

    ])

    return {"result": response.text}
