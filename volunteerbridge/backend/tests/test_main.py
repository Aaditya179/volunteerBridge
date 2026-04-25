"""Tests for the VolunteerBridge API endpoints and services."""

import math
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from services.matching import (
    compute_final_score,
    cosine_similarity,
    match_volunteers,
    proximity_score,
    reliability_score,
)


class TestMatchingService:
    """Tests for the volunteer matching engine."""

    def test_cosine_similarity_identical_vectors(self) -> None:
        vec = [1.0, 2.0, 3.0]
        assert cosine_similarity(vec, vec) == pytest.approx(1.0, abs=1e-6)

    def test_cosine_similarity_orthogonal_vectors(self) -> None:
        vec1 = [1.0, 0.0, 0.0]
        vec2 = [0.0, 1.0, 0.0]
        assert cosine_similarity(vec1, vec2) == pytest.approx(0.0, abs=1e-6)

    def test_cosine_similarity_zero_vector(self) -> None:
        vec1 = [0.0, 0.0, 0.0]
        vec2 = [1.0, 2.0, 3.0]
        assert cosine_similarity(vec1, vec2) == 0.0

    def test_proximity_score_same_location(self) -> None:
        loc = {"lat": 19.0760, "lng": 72.8777}
        score = proximity_score(loc, loc)
        assert score == pytest.approx(1.0, abs=1e-6)

    def test_proximity_score_far_location(self) -> None:
        loc1 = {"lat": 19.0760, "lng": 72.8777}  # Mumbai
        loc2 = {"lat": 28.6139, "lng": 77.2090}  # Delhi
        score = proximity_score(loc1, loc2)
        assert 0.0 < score < 0.1  # ~1200 km apart, should be low score

    def test_proximity_score_nearby(self) -> None:
        loc1 = {"lat": 19.0760, "lng": 72.8777}
        loc2 = {"lat": 19.0800, "lng": 72.8800}  # ~500m away
        score = proximity_score(loc1, loc2)
        assert score > 0.9

    def test_reliability_score_new_volunteer(self) -> None:
        volunteer = {"completion_rate": 1.0, "tasks_completed": 0}
        score = reliability_score(volunteer)
        assert score == pytest.approx(0.7, abs=1e-6)

    def test_reliability_score_experienced_volunteer(self) -> None:
        volunteer = {"completion_rate": 0.95, "tasks_completed": 100}
        score = reliability_score(volunteer)
        expected = (0.95 * 0.7) + (1.0 * 0.3)  # capped at 50 tasks
        assert score == pytest.approx(expected, abs=1e-6)

    def test_reliability_score_low_completion(self) -> None:
        volunteer = {"completion_rate": 0.5, "tasks_completed": 25}
        score = reliability_score(volunteer)
        expected = (0.5 * 0.7) + (25 / 50 * 0.3)
        assert score == pytest.approx(expected, abs=1e-6)

    def test_compute_final_score_weights(self) -> None:
        score = compute_final_score(1.0, 1.0, 1.0)
        assert score == pytest.approx(1.0, abs=1e-6)

    def test_compute_final_score_zero(self) -> None:
        score = compute_final_score(0.0, 0.0, 0.0)
        assert score == pytest.approx(0.0, abs=1e-6)

    def test_compute_final_score_partial(self) -> None:
        score = compute_final_score(0.8, 0.6, 0.9)
        expected = (0.5 * 0.8) + (0.3 * 0.6) + (0.2 * 0.9)
        assert score == pytest.approx(expected, abs=1e-6)

    def test_match_volunteers_returns_top_3(self) -> None:
        need = {
            "required_skills": ["Medical", "First Aid"],
            "location": {"lat": 19.0760, "lng": 72.8777},
        }
        volunteers = [
            {
                "name": f"Volunteer {i}",
                "skills": ["Medical"] if i % 2 == 0 else ["Teaching"],
                "location": {"lat": 19.0760 + i * 0.01, "lng": 72.8777},
                "availability": True,
                "completion_rate": 0.9,
                "tasks_completed": i * 5,
            }
            for i in range(10)
        ]
        results = match_volunteers(need, volunteers)
        assert len(results) <= 3
        scores = [r["final_score"] for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_match_volunteers_skips_unavailable(self) -> None:
        need = {
            "required_skills": ["Medical"],
            "location": {"lat": 19.0760, "lng": 72.8777},
        }
        volunteers = [
            {
                "name": "Unavailable",
                "skills": ["Medical"],
                "location": {"lat": 19.0760, "lng": 72.8777},
                "availability": False,
                "completion_rate": 1.0,
                "tasks_completed": 50,
            },
            {
                "name": "Available",
                "skills": ["Medical"],
                "location": {"lat": 19.0760, "lng": 72.8777},
                "availability": True,
                "completion_rate": 0.5,
                "tasks_completed": 5,
            },
        ]
        results = match_volunteers(need, volunteers)
        assert len(results) == 1
        assert results[0]["volunteer"]["name"] == "Available"

    def test_match_volunteers_empty_list(self) -> None:
        need = {
            "required_skills": ["Medical"],
            "location": {"lat": 0, "lng": 0},
        }
        results = match_volunteers(need, [])
        assert results == []

    def test_match_result_has_reasoning(self) -> None:
        need = {
            "required_skills": ["Medical"],
            "location": {"lat": 19.0760, "lng": 72.8777},
        }
        volunteers = [
            {
                "name": "Test Vol",
                "skills": ["Medical"],
                "location": {"lat": 19.0760, "lng": 72.8777},
                "availability": True,
                "completion_rate": 1.0,
                "tasks_completed": 10,
            },
        ]
        results = match_volunteers(need, volunteers)
        assert len(results) == 1
        assert "Skill match:" in results[0]["reasoning"]
        assert "Distance score:" in results[0]["reasoning"]
        assert "Reliability:" in results[0]["reasoning"]


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    @patch("main.firebase_admin")
    def test_health_returns_ok(self) -> None:
        from main import app

        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "VolunteerBridge API"
        assert data["version"] == "1.0.0"
