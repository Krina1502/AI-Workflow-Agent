from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
import requests

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_community.embeddings import HuggingFaceEmbeddings

# Local embeddings (no API key needed)
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = None
query_log = []

def process_file(file_path: str):
    global db

    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        if not docs:
            raise ValueError("PDF appears to be empty or unreadable")

        splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)

        db = FAISS.from_documents(chunks, embeddings_model)
        return "File processed successfully"
    except Exception as e:
        raise RuntimeError(f"Failed to process file: {str(e)}")

def ask_question(query: str) -> str:
    global db, query_log

    if db is None:
        return "No document loaded. Please upload a PDF first."

    docs = db.similarity_search(query, k=4)
    context = "\n".join([d.page_content for d in docs])

    # Call local Ollama
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": f"Answer using the context below. Be concise.\n\nContext:\n{context}\n\nQuestion: {query}",
            "stream": False
        }
    )

    if response.status_code != 200:
        raise RuntimeError(f"Ollama error: {response.text}")

    answer = response.json().get("response", "No response from model")
    query_log.append({"query": query, "answer": answer})
    return answer

def get_logs() -> list:
    return query_log
