import os
from dotenv import load_dotenv
from groq import Groq

# Load .env once at startup
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing")

# ✅ Groq client (this is NOT OpenAI)
client = Groq(api_key=GROQ_API_KEY)


def employee_prompt(facts: dict) -> str:
    return (
        "Generate a formal employee performance report based strictly on the records provided below.\n\n"
        "Rules:\n"
        "- Treat the data as authoritative records\n"
        "- Do not exaggerate or assume missing information\n"
        "- Use a professional report tone\n"
        "- Organize the output into clear sections\n"
        "- Keep the report under 150 words\n\n"
        "Employee Record:\n"
        f"Name: {facts['name']}\n"
        f"Role: {facts['role']}\n"
        f"Team: {facts['team']}\n"
        f"Employment Status: {'Active' if facts['active'] else 'Inactive'}\n"
        f"Total Contributions: {facts['contributions']}\n"
        f"Pull Requests Merged: {facts['prs_merged']}\n"
        f"Issues Closed: {facts['issues_closed']}\n"
        f"Recorded Activities: {facts['activities']}\n"
        f"Impact Score: {facts['impact_score']}\n\n"
        "Generate a performance report suitable for management review."
    )



def generate_ai_summary(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # ✅ ACTIVE GROQ MODEL
            messages=[
                {
                    "role": "system",
                    "content": "You are an HR analytics engine that generates factual performance reports from structured employee records."
                }
,
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=200
,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("GROQ ERROR:", e)
        return "Performance summary currently unavailable."
