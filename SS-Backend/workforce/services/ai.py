import os
from dotenv import load_dotenv

try:
    from groq import Groq
except ImportError:
    Groq = None

# Load .env once at startup
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ✅ Groq client (this is NOT OpenAI)
if Groq and GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None


def employee_prompt(facts: dict) -> str:
    return (
        "Generate a formal employee performance report based strictly on the records provided below.\n\n"
        "Rules:\n"
        "- Treat the data as authoritative records\n"
        "- Do NOT assume or invent missing information\n"
        "- Reference ONLY metrics that are relevant to the employee’s role or team\n"
        "- If a metric is not applicable, omit it entirely from the report\n"
        "- Use a professional management-review tone\n"
        "- Organize the output into clear sections\n"
        "- Keep the report under 150 words\n\n"
        "Guidance on metrics:\n"
        "- Engineering roles may include: code contributions, pull requests, issues, activities\n"
        "- Product roles may include: feature delivery, coordination, planning impact\n"
        "- Design roles may include: design outputs, reviews, collaboration\n"
        "- Marketing roles may include: campaigns, content, outreach\n"
        "- If a metric value is null, zero, or missing, do not mention it\n\n"
        "Employee Record:\n"
        f"Name: {facts['name']}\n"
        f"Role: {facts['role']}\n"
        f"Team: {facts['team']}\n"
        f"Employment Status: {'Active' if facts['active'] else 'Inactive'}\n"
        f"Total Contributions: {facts.get('contributions')}\n"
        f"Pull Requests Merged: {facts.get('prs_merged')}\n"
        f"Issues Closed: {facts.get('issues_closed')}\n"
        f"Recorded Activities: {facts.get('activities')}\n"
        f"Impact Score: {facts.get('impact_score')}\n\n"
        "Generate a concise performance report suitable for management review."
    )




def generate_ai_summary(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an HR analytics engine that generates factual performance reports from structured employee records."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=200,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("GROQ ERROR:", e)
        return "Performance summary currently unavailable."