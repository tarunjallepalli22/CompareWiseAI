import os
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

class ProsConsItem(BaseModel):
    vendor_name: str
    pros: List[str]
    cons: List[str]

class ComparisonSummary(BaseModel):
    executive_summary: str
    pros_cons: List[ProsConsItem]
    recommendation: str
from dotenv import load_dotenv
load_dotenv()
client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
try:
    client.models.generate_content(
        model='gemini-2.5-flash-lite',
        contents='test',
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            response_schema=ComparisonSummary
        )
    )
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
