Write-Host "Starting CompareWise AI..." -ForegroundColor Green
Write-Host "Make sure you have copied .env.example to .env and added your GEMINI_API_KEY" -ForegroundColor Yellow

.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
