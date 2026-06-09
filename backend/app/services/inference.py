import re
import os
from typing import List, Dict, Any
from transformers import pipeline

# Base directory is three levels up from this file (app/services/inference.py -> app/services -> app -> backend)
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# MODEL_PATH = os.path.join(BASE_DIR, "model")
MODEL_PATH = "farrukhweb/mindcare"

# Load model once at startup
classifier = None

def init_model():
    global classifier
    if classifier is None:
        classifier = pipeline(
            "text-classification",
            model=MODEL_PATH,
            tokenizer=MODEL_PATH,
            top_k=None # Returns probabilities for all classes
        )

def clean_text(text: str) -> str:
    """Lowercases, strips URLs, and removes special characters."""
    text = text.lower()
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    # Remove special characters but keep basic punctuation for natural language
    text = re.sub(r'[^a-z0-9\s.,!?\'-]', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def predict(text: str) -> Dict[str, Any]:
    cleaned = clean_text(text)
    
    results = classifier(cleaned, top_k=None)
    
    # Results is typically a list of dicts: [{'label': 'Anxiety', 'score': 0.1}, ...]
    # when given a single string
    if isinstance(results[0], list):
        results = results[0]
        
    probabilities = {res['label']: res['score'] for res in results}
    
    # Get highest confidence label
    best_label = max(probabilities, key=probabilities.get)
    confidence = probabilities[best_label] * 100
    
    return {
        "label": best_label,
        "confidence": confidence,
        "probabilities": probabilities
    }

def get_polarity_score(label: str, confidence_pct: float) -> float:
    weights = {
        "Normal": 1.0,
        "Anxiety": 0.3,
        "Stress": 0.3,
        "Depression": 0.0
    }
    # Multiply weight by confidence (0 to 1) and scale to 100
    # Wait, confidence_pct is 0 to 100
    return weights.get(label, 0.0) * confidence_pct

def weekly_report(entries: List[str]) -> Dict[str, Any]:
    if not entries:
        return {}
        
    breakdown = []
    state_counts = {"Anxiety": 0, "Depression": 0, "Normal": 0, "Stress": 0}
    total_polarity = 0.0
    
    for entry in entries:
        pred = predict(entry)
        label = pred["label"]
        state_counts[label] = state_counts.get(label, 0) + 1
        
        polarity = get_polarity_score(label, pred["confidence"])
        total_polarity += polarity
        
        breakdown.append({
            "text": entry,
            "prediction": pred,
            "polarity_score": polarity
        })
        
    avg_polarity = total_polarity / len(entries) if entries else 0.0
    
    if avg_polarity >= 70:
        polarity_label = "Healthy"
    elif avg_polarity >= 50:
        polarity_label = "Moderate"
    else:
        polarity_label = "At Risk"
        
    dominant_state = max(state_counts, key=state_counts.get)
    
    # Trend calculation
    trend = "stable"
    if len(entries) >= 2:
        mid = len(entries) // 2
        first_half = breakdown[:mid]
        second_half = breakdown[mid:]
        
        first_avg = sum(item["polarity_score"] for item in first_half) / len(first_half) if first_half else 0
        second_avg = sum(item["polarity_score"] for item in second_half) / len(second_half) if second_half else 0
        
        diff = second_avg - first_avg
        if diff > 5: # Threshold for improving
            trend = "improving"
        elif diff < -5:
            trend = "worsening"
            
    return {
        "weekly_polarity": avg_polarity,
        "polarity_label": polarity_label,
        "dominant_state": dominant_state,
        "trend": trend,
        "state_counts": state_counts,
        "per_entry_breakdown": breakdown
    }
