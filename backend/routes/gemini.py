import os
import io
import json
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, HTTPException
from google import genai
from google.genai import types # Import types for configuration
from PIL import Image

router = APIRouter()
CLIENT = None

def get_client():
    global CLIENT
    if CLIENT is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
        # Ensure you are using the correct SDK initialization
        CLIENT = genai.Client(api_key=api_key)
    return CLIENT

@router.post("/identify")
async def identify_dog(
    file1: UploadFile = File(...),
    file2: Optional[UploadFile] = File(None),
    file3: Optional[UploadFile] = File(None)
):
    client = get_client()

    # 1. Process Images
    images = []
    # Collect all provided files into a list
    provided_files = [file1, file2, file3]
    
    for file in provided_files:
        if file and file.filename: # Check if file actually exists
            try:
                image_data = await file.read()
                img = Image.open(io.BytesIO(image_data))
                images.append(img)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid image file: {file.filename}")

    if not images:
        raise HTTPException(status_code=400, detail="No valid images uploaded.")

    # 2. Define the Prompt
    prompt = """
    Analyze these dog photos and return the following in JSON format:
    {
        "breed": "the identified breed",
        "size_category": "small", "medium", or "large",
        "estimated_weight_lbs": "estimated weight as a range",
        "estimated_age_years": "estimated age as a range"
    }

    Use the following categories for size_category:
    - small: 0 to 23 lbs
    - medium: 24 to 50 lbs
    - large: 51+ lbs

    Use all the provided images together to make a more accurate identification.
    """

    try:
        # 3. Call Gemini with JSON Response Mime Type
        # This ensures the model returns ONLY valid JSON
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[prompt] + images,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        # 4. Parse the text into a dictionary so FastAPI returns it as JSON
        # instead of a string-inside-a-string.
        result_data = json.loads(response.text)
        return result_data

    except Exception as e:
        # Catch JSON parsing errors or API errors
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")