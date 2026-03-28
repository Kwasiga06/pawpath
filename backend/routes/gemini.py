from fastapi import APIRouter, UploadFile, File
from google import genai

client = genai.Client()

router = APIRouter()

@router.post("/identify")
async def identify(file: UploadFile = File(...)):
    image_data = await file.read()

    prompt = """
    Analyze this dog photo and return the following in JSON format:
    {
        "breed": "the identified breed",
        "size_category": "small", "medium", or "large",
        "estimated_weight_lbs": "estimated weight as a range",
        "estimated_age_years": "estimated age as a range"
    }

    Use the following categories for size_category:
    - small: 0-20 lbs
    - medium: 21-50 lbs
    - large: 51+ lbs

    Only return the JSON object, do not include any additional text.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            prompt,
            {"mime_type": file.content_type, "data": image_data}
        ]
    )

    return {"result": response.text}
