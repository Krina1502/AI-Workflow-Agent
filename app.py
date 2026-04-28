from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

from rag import process_file, ask_question, get_logs
from workflows import create_ticket, list_tickets, send_email_summary

app = FastAPI(title="AI Workflow Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Health ────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "AI Workflow Agent Running..."}


# ── Document Intelligence ─────────────────────────────────
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = process_file(file_path)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": result, "filename": file.filename}


# ── RAG Chat ──────────────────────────────────────────────
@app.get("/ask")
def ask(question: str):
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    answer = ask_question(question)
    return {"question": question, "answer": answer}


# ── Dashboard / Logs ──────────────────────────────────────
@app.get("/logs")
def logs():
    return {"logs": get_logs()}


# ── Workflow: Support Tickets ─────────────────────────────
class TicketRequest(BaseModel):
    subject: str
    description: str
    priority: str = "medium"

@app.post("/tickets")
def new_ticket(req: TicketRequest):
    ticket = create_ticket(req.subject, req.description, req.priority)
    return {"ticket": ticket}

@app.get("/tickets")
def get_tickets():
    return {"tickets": list_tickets()}


# ── Workflow: Email Summary ───────────────────────────────
class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str

@app.post("/email")
def email_summary(req: EmailRequest):
    result = send_email_summary(req.to, req.subject, req.body)
    return {"result": result}
