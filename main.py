import os
import io
import json
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from PyPDF2 import PdfReader
import docx
import pandas as pd
import hashlib
import ollama

# Initialize FastAPI app
app = FastAPI(title="CompareWise AI API")

# Global progress tracker
progress_status = {"status": "Idle", "progress": 0}

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Pydantic Models for Structured Output
# ---------------------------------------------------------
class VendorProposal(BaseModel):
    vendor_name: str = Field(description="Name of the vendor")
    total_cost: str = Field(description="Total cost or pricing details mentioned")
    timeline: str = Field(description="Implementation timeline or duration")
    sla: str = Field(description="Service Level Agreement (SLA) terms")
    key_deliverables: List[str] = Field(description="List of key deliverables")
    risk_clauses: List[str] = Field(description="Any non-standard terms, penalties, or risk clauses")

class ProsConsItem(BaseModel):
    vendor_name: str = Field(description="Name of the vendor")
    pros: List[str] = Field(description="List of pros")
    cons: List[str] = Field(description="List of cons")

class ComparisonSummary(BaseModel):
    executive_summary: str = Field(description="A brief executive summary of all proposals")
    pros_cons: List[ProsConsItem] = Field(description="List of pros and cons for each vendor")
    recommendation: str = Field(description="A final recommendation based on cost and risk")

# ---------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------
def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    text = ""
    if filename.endswith('.pdf'):
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted: text += extracted + "\n"
    elif filename.endswith('.docx'):
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    elif filename.endswith('.xlsx'):
        df = pd.read_excel(io.BytesIO(file_bytes))
        text = df.to_string()
    return text

# Global cache for extracted files
extraction_cache = {}

# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.get("/api/progress")
async def get_progress():
    return progress_status

@app.post("/api/compare")
async def compare_proposals(files: List[UploadFile] = File(...)):
    global progress_status
    progress_status = {"status": "Starting analysis...", "progress": 5}
    
    if not files or len(files) < 2:
        progress_status = {"status": "Failed", "progress": 0}
        raise HTTPException(status_code=400, detail="Please upload at least 2 PDF proposals for comparison.")

    extracted_proposals = []
    
    # 1. Extract and Analyze each PDF individually
    total_files = len(files)
    for idx, file in enumerate(files):
        if not (file.filename.endswith('.pdf') or file.filename.endswith('.docx') or file.filename.endswith('.xlsx')):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not supported.")
        
        progress_status = {"status": f"Reading {file.filename}...", "progress": 10 + int(30 * (idx / total_files))}
        
        content = await file.read()
        file_hash = hashlib.md5(content).hexdigest()
        
        if file_hash in extraction_cache:
            progress_status = {"status": f"Using cached data for {file.filename}...", "progress": 10 + int(40 * ((idx+1) / total_files))}
            extracted_proposals.append(extraction_cache[file_hash])
            continue
            
        file_text = extract_text_from_file(content, file.filename)
        
        extraction_prompt = f"""
        You are a professional procurement analyst. Extract key metrics from the vendor proposal text provided below.
        
        TEXT:
        {file_text[:8000]}
        
        REQUIRED FIELDS:
        1. 'vendor_name': Official name of the company.
        2. 'total_cost': The estimated or total project cost (e.g., "$50,000" or "Contact for quote").
        3. 'timeline': Project duration or start date.
        4. 'sla': Service Level Agreements or guarantees.
        5. 'key_deliverables': List of specific items or services provided.
        6. 'risk_clauses': Any potential legal risks or red flags.
        
        STRICTLY return a VALID JSON object. Do NOT use emojis, text-emoticons, or generic placeholders like ":(". Use "Not Specified" if data is missing.
        """
        
        try:
            progress_status = {"status": f"Extracting metrics from {file.filename} via Ollama...", "progress": 10 + int(40 * ((idx+1) / total_files))}
            response = await asyncio.to_thread(
                ollama.chat,
                model='llama3.2',
                messages=[{'role': 'user', 'content': extraction_prompt}],
                format=VendorProposal.model_json_schema()
            )
            response_text = response['message']['content'].strip()
            vendor_data = json.loads(response_text)
            
            # Cache the result
            extraction_cache[file_hash] = vendor_data
            extracted_proposals.append(vendor_data)
        except Exception as e:
            error_msg = f"Error processing {file.filename}: {type(e).__name__} - {str(e)}\n"
            print(error_msg)
            with open("error_log.txt", "a") as f: f.write(error_msg)
            progress_status = {"status": "Error occurred", "progress": 0}
            raise HTTPException(status_code=500, detail=f"Failed to extract data from {file.filename}.")
            
    # 2. Generate Comparison Summary
    progress_status = {"status": "Analyzing all vendors and generating executive summary...", "progress": 60}
    comparison_prompt = f"""
    You are an expert executive procurement advisor. Review the following structured data extracted from multiple vendor proposals.
    
    TASK:
    1. Provide a comprehensive 'executive_summary' (at least 3-4 sentences) comparing the options.
    2. For EACH vendor in the list, provide a list of 'pros' and 'cons' based on their specific pricing, timeline, and risks.
    3. Provide a clear, definitive 'recommendation' on which vendor to choose and why.
    
    DATA:
    {json.dumps(extracted_proposals, indent=2)}
    
    STRICTLY return the response in JSON format matching the requested schema.
    """
    
    try:
        summary_response = await asyncio.to_thread(
            ollama.chat,
            model='llama3.2',
            messages=[{'role': 'user', 'content': comparison_prompt}],
            format=ComparisonSummary.model_json_schema()
        )
        summary_text = summary_response['message']['content'].strip()
        comparison_data = json.loads(summary_text)
    except Exception as e:
        error_msg = f"Error generating summary: {type(e).__name__} - {str(e)}\n"
        print(error_msg)
        with open("error_log.txt", "a") as f: f.write(error_msg)
        progress_status = {"status": "Error occurred", "progress": 0}
        raise HTTPException(status_code=500, detail="Failed to generate executive summary.")

    progress_status = {"status": "Complete", "progress": 100}

    return {
        "status": "success",
        "proposals": extracted_proposals,
        "comparison": comparison_data
    }

# Mount static files for the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
