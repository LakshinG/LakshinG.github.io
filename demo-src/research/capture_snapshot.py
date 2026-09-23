"""Run the real pipeline (ingestion, hybrid retrieval, critic) on the repo's sample papers and
save the results for the static demo. The critic's model is swapped for a local Ollama model
because Gemini/OpenAI need an API key."""
import json
import os
import shutil
import sys

from langchain_ollama import ChatOllama

from src.ingestion import IngestionPipeline
from src.vector_store import VectorStoreManager
from src.critic import CriticAgent

MODEL = "qwen2.5:7b"
PAPERS = ["Doe_2023_10.1234.pdf", "Smith_2024_10.5678.pdf"]
QUERIES = [
    "Does drinking coffee increase the number of bugs developers write?",
    "How do the two studies' sample sizes and methods compare?",
    "Is caffeine intake linked to software quality?",
]
OUT = sys.argv[1] if len(sys.argv) > 1 else "snapshot.json"

shutil.rmtree("./chroma_demo", ignore_errors=True)
pipeline = IngestionPipeline()
chunks = []
for p in PAPERS:
    c = pipeline.process_file(p)
    print(p, "->", len(c), "chunks")
    chunks.extend(c)

store = VectorStoreManager(persist_directory="./chroma_demo")
store.add_documents(chunks)
retriever = store.create_hybrid_retriever(chunks, k=4)
critic = CriticAgent(llm=ChatOllama(model=MODEL, temperature=0, base_url="http://127.0.0.1:11434"))

results = []
for q in QUERIES:
    docs = retriever.invoke(q)
    critique = critic.analyze({"query": q, "documents": docs, "critique": ""})["critique"]
    print("\nQ:", q, "\n", critique[:300])
    results.append({
        "query": q,
        "documents": [{
            "source": os.path.basename(d.metadata.get("source", "")),
            "author": d.metadata.get("author"),
            "year": d.metadata.get("year"),
            "text": " ".join(d.page_content.split()),
        } for d in docs],
        "critique": critique,
    })

papers = [{"file": p, "text": " ".join(" ".join(c.page_content for c in chunks
           if os.path.basename(c.metadata.get("source", "")) == p).split())} for p in PAPERS]
json.dump({"model": MODEL, "papers": papers, "results": results},
          open(OUT, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("saved", OUT)
