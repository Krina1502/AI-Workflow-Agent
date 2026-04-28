from datetime import datetime
import uuid

# In-memory store (swap for a real DB in production)
tickets = []

def create_ticket(subject: str, description: str, priority: str = "medium") -> dict:
    ticket = {
        "id": str(uuid.uuid4())[:8],
        "subject": subject,
        "description": description,
        "priority": priority,
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
    }
    tickets.append(ticket)
    return ticket

def list_tickets() -> list:
    return tickets

def send_email_summary(to: str, subject: str, body: str) -> dict:
    """
    Simulates sending an email. 
    Wire up SendGrid / SES / SMTP here for real sending.
    """
    log = {
        "to": to,
        "subject": subject,
        "body": body,
        "sent_at": datetime.utcnow().isoformat(),
        "status": "simulated",
    }
    print(f"[EMAIL SIMULATED] To: {to} | Subject: {subject}")
    return log
