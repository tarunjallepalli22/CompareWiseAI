# CompareWise AI 🧠💼

CompareWise AI is an **offline-first, enterprise-grade procurement intelligence platform** built to automate the extraction, analysis, and comparison of complex vendor proposals.

By leveraging local Large Language Models (LLMs) via Ollama, CompareWise AI completely eliminates the data privacy risks associated with cloud APIs. It allows procurement teams to extract pricing, timelines, SLAs, deliverables, and hidden risk clauses from `PDF`, `DOCX`, and `XLSX` files securely on their own hardware.

---

## ✨ Key Features
- **100% Offline & Private:** Powered by Ollama (`llama3.2`), ensuring sensitive enterprise vendor data never leaves your machine. No API keys or cloud costs required.
- **Smart Metric Extraction:** Semantically extracts specific data points (Cost, Timeline, Deliverables) regardless of how the vendor formatted their proposal.
- **Risk Clause Detection:** Automatically flags unfavorable termination clauses, hidden fees, or weak liability caps.
- **Executive Comparison Engine:** Generates a side-by-side matrix, pros/cons list, and a definitive AI recommendation.
- **Intelligent File Caching:** Remembers previously uploaded files using MD5 hashing to return instant results (0.01s) on repeat uploads.
- **Multi-Format Support:** Drag and drop `.pdf`, `.docx`, and `.xlsx` files simultaneously.
- **Premium UI:** Features a sleek, responsive Glassmorphism design with seamless Light/Dark mode toggling.

---

## 🚀 Getting Started

### Prerequisites
1. **Python 3.9+** installed on your system.
2. **Ollama** installed and running on your local machine.
3. The `llama3.2` model downloaded in Ollama (`ollama run llama3.2`).

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/CompareWiseAI.git
   cd CompareWiseAI
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application
To start the backend server and serve the frontend, run:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*(Or simply run the included `run.ps1` script if you are on Windows PowerShell).*

Once running, open your browser and navigate to: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🛠️ Technology Stack
- **Backend:** Python, FastAPI, Uvicorn
- **AI Processing:** Ollama (Local LLM Integration)
- **Frontend:** Vanilla HTML, CSS (Glassmorphism), JavaScript
- **Document Parsing:** PyPDF2, python-docx, pandas, openpyxl

---

## 🔒 Privacy & Security
This project was specifically engineered for enterprise use cases where data privacy is paramount. Because it uses local inference, you can confidently process confidential pricing and legal documents without violating corporate data sharing policies.
