from google import genai
from app.settings import settings

def ask_gemini(chatHistory: list, assessment) -> str:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    if assessment:
        assessment_context = f"""
        User's latest mental health assessment:
        - Anxiety: {assessment.anxiety_score} ({assessment.anxiety_severity})
        - Depression: {assessment.depression_score} ({assessment.depression_severity})
        - Stress: {assessment.stress_score} ({assessment.stress_severity})
        """
    else:
        assessment_context = """
        No assessment record found for this user yet.
        Gently encourage them to take the mental health assessment first,
        so they can get a better understanding of how they are feeling emotionally.
        Let them know it only takes a few minutes and can be very helpful
        for their self-awareness and overall wellbeing.
        """

    system_prompt = f"""
    You are a supportive mental health companion — not a licensed therapist or medical professional.
    Your role is to listen, encourage, and provide general emotional support only.

    Important boundaries:
    - Do NOT diagnose any mental health condition
    - Do NOT prescribe or suggest medications
    - Do NOT replace professional therapy or medical advice
    - If the user seems in serious distress, gently encourage them to seek professional help

    Always remind users that you are just a helper tool, not a substitute for professional care.

    Response style:
    - Keep responses short and concise
    - No long paragraphs — 2 to 3 sentences max
    - Be warm, simple and easy to understand
    - Get straight to the point

    {assessment_context}

    Use the assessment data (if available) to better understand the user's current
    mental state and respond with empathy and care accordingly.
    """

    contents = [
        {
            "role": msg["role"],
            "parts": msg["parts"]
        }
        for msg in chatHistory
    ]

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=contents,
        config={
            "system_instruction": system_prompt
        }
    )

    return response.text