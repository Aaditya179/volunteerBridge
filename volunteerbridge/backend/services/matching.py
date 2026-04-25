"""Volunteer-to-need matching engine with multi-factor scoring."""

import math
from typing import Dict, List

import numpy as np


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two vectors.

    Args:
        vec1: First embedding vector.
        vec2: Second embedding vector.

    Returns:
        Cosine similarity score between 0 and 1.
    """
    a = np.array(vec1, dtype=np.float64)
    b = np.array(vec2, dtype=np.float64)
    dot_product = np.dot(a, b)
    magnitude_a = np.linalg.norm(a)
    magnitude_b = np.linalg.norm(b)

    if magnitude_a == 0.0 or magnitude_b == 0.0:
        return 0.0

    return float(dot_product / (magnitude_a * magnitude_b))


def proximity_score(volunteer_location: Dict, need_location: Dict) -> float:
    """Calculate proximity score using the Haversine formula.

    Closer volunteers receive higher scores. The score decays with distance
    using the formula: 1 / (1 + distance_km / 10).

    Args:
        volunteer_location: Dict with 'lat' and 'lng' keys.
        need_location: Dict with 'lat' and 'lng' keys.

    Returns:
        Proximity score between 0 and 1.
    """
    lat1 = math.radians(volunteer_location["lat"])
    lat2 = math.radians(need_location["lat"])
    dlat = math.radians(need_location["lat"] - volunteer_location["lat"])
    dlng = math.radians(need_location["lng"] - volunteer_location["lng"])

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    earth_radius_km = 6371.0
    distance_km = earth_radius_km * c

    return 1.0 / (1.0 + distance_km / 10.0)


def reliability_score(volunteer: Dict) -> float:
    """Calculate volunteer reliability score from historical performance.

    Weighted combination of completion rate (70%) and experience capped
    at 50 tasks (30%).

    Args:
        volunteer: Dict with 'completion_rate' and 'tasks_completed' keys.

    Returns:
        Reliability score between 0 and 1.
    """
    completion = volunteer.get("completion_rate", 1.0)
    tasks = volunteer.get("tasks_completed", 0)
    experience_factor = min(tasks, 50) / 50.0
    return (completion * 0.7) + (experience_factor * 0.3)


def compute_final_score(
    skill_score: float, proximity: float, reliability: float
) -> float:
    """Compute weighted final match score.

    Weights: skill 50%, proximity 30%, reliability 20%.

    Args:
        skill_score: Skill match score (0-1).
        proximity: Proximity score (0-1).
        reliability: Reliability score (0-1).

    Returns:
        Weighted final score between 0 and 1.
    """
    return (0.5 * skill_score) + (0.3 * proximity) + (0.2 * reliability)


def _compute_skill_score(need_skills: List[str], volunteer_skills: List[str]) -> float:
    """Compute skill overlap score between need and volunteer.

    Args:
        need_skills: List of required skill strings.
        volunteer_skills: List of volunteer's skill strings.

    Returns:
        Fraction of required skills the volunteer possesses (0-1).
    """
    if not need_skills:
        return 1.0

    need_set = {s.lower().strip() for s in need_skills}
    vol_set = {s.lower().strip() for s in volunteer_skills}
    overlap = need_set.intersection(vol_set)
    return len(overlap) / len(need_set)


def match_volunteers(need: Dict, volunteers: List[Dict]) -> List[Dict]:
    """Match and rank volunteers for a community need.

    Computes skill, proximity, and reliability scores for each available
    volunteer and returns the top 3 matches sorted by final score.

    Args:
        need: Dict representing the community need with 'required_skills'
              and 'location' keys.
        volunteers: List of volunteer dicts.

    Returns:
        Top 3 match results as list of dicts with all scores.
    """
    results: List[Dict] = []
    need_location = need.get("location", {"lat": 0, "lng": 0})
    need_skills = need.get("required_skills", [])

    for volunteer in volunteers:
        if not volunteer.get("availability", False):
            continue

        vol_location = volunteer.get("location", {"lat": 0, "lng": 0})
        skill = _compute_skill_score(need_skills, volunteer.get("skills", []))
        prox = proximity_score(vol_location, need_location)
        rel = reliability_score(volunteer)
        final = compute_final_score(skill, prox, rel)

        # Estimate travel time: ~30 km/h average urban speed
        lat1 = math.radians(vol_location["lat"])
        lat2 = math.radians(need_location["lat"])
        dlat = math.radians(need_location["lat"] - vol_location["lat"])
        dlng = math.radians(need_location["lng"] - vol_location["lng"])
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance_km = 6371.0 * c
        travel_minutes = round((distance_km / 30.0) * 60.0, 1)

        reasoning = (
            f"Skill match: {skill:.0%} | "
            f"Distance score: {prox:.0%} | "
            f"Reliability: {rel:.0%}"
        )

        results.append({
            "volunteer": volunteer,
            "skill_score": round(skill, 4),
            "proximity_score": round(prox, 4),
            "reliability_score": round(rel, 4),
            "final_score": round(final, 4),
            "travel_minutes": travel_minutes,
            "reasoning": reasoning,
        })

    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results[:3]
