"""VolunteerBridge API — AI-powered volunteer coordination platform.

FastAPI application with endpoints for survey ingestion, volunteer matching,
task assignment, and crisis intelligence reporting.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Dict, List

import firebase_admin
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore

from models.schemas import (
    AssignRequest,
    CommunityNeed,
    CrisisReport,
    IngestRequest,
    IngestResponse,
    MatchRequest,
    MatchResult,
    Volunteer,
)
from services.fcm import send_task_notification
from services.gemini import (
    extract_need_from_image,
    extract_need_from_text,
    generate_crisis_report,
)
from services.matching import match_volunteers

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
        logger.warning(
            "No service account key found at %s. Using Application Default Credentials.",
            cred_path,
        )

db = firestore.client()

# Initialize Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
else:
    logger.warning("GEMINI_API_KEY not set. AI features will not work.")

# Create FastAPI app
app = FastAPI(
    title="VolunteerBridge API",
    description="AI-powered volunteer coordination platform for NGOs",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _need_doc_to_dict(doc_id: str, data: Dict) -> Dict:
    """Convert a Firestore need document to a dictionary with ID."""
    result = dict(data)
    result["id"] = doc_id
    if "created_at" in result and result["created_at"]:
        if hasattr(result["created_at"], "isoformat"):
            pass
        else:
            result["created_at"] = datetime.now(timezone.utc).isoformat()
    return result


def _volunteer_doc_to_dict(doc_id: str, data: Dict) -> Dict:
    """Convert a Firestore volunteer document to a dictionary with ID."""
    result = dict(data)
    result["id"] = doc_id
    return result


@app.get("/health")
async def health_check() -> Dict:
    """Health check endpoint returning service status."""
    return {
        "status": "ok",
        "service": "VolunteerBridge API",
        "version": "1.0.0",
    }


@app.post("/ingest", response_model=IngestResponse)
async def ingest_survey(request: IngestRequest) -> IngestResponse:
    """Ingest survey data (image or text) and extract community needs using Gemini AI.

    The extracted data is validated, stored in Firestore, and returned with
    a confidence score. Low-confidence extractions are flagged for human review.
    """
    try:
        if request.image_base64:
            extraction = extract_need_from_image(request.image_base64)
        elif request.text_content:
            extraction = extract_need_from_text(request.text_content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either image_base64 or text_content must be provided.",
            )
    except Exception as exc:
        logger.error("Gemini extraction failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"AI extraction failed: {str(exc)}",
        )

    confidence = extraction.get("confidence_score", 0.5)

    need = CommunityNeed(
        need_type=extraction.get("need_type", "Unknown"),
        urgency_score=min(max(int(extraction.get("urgency_score", 5)), 1), 10),
        required_skills=extraction.get("required_skills", ["General Support"]),
        location={
            "lat": 0.0,
            "lng": 0.0,
            "zone": extraction.get("gps_zone", "Unknown Zone"),
        },
        volunteer_hours_needed=float(extraction.get("volunteer_hours_needed", 4.0)),
        confidence_score=confidence,
        raw_text=extraction.get("raw_extracted_text", ""),
        status="unassigned",
        org_id=request.org_id,
        created_at=datetime.now(timezone.utc),
    )

    need_dict = need.model_dump()
    need_dict["created_at"] = need_dict["created_at"].isoformat()

    doc_ref = (
        db.collection("organizations")
        .document(request.org_id)
        .collection("needs")
        .document()
    )
    doc_ref.set(need_dict)
    need.id = doc_ref.id

    review_required = confidence < 0.75

    return IngestResponse(
        need=need,
        confidence_score=confidence,
        review_required=review_required,
    )


@app.post("/match", response_model=List[MatchResult])
async def match_need_to_volunteers(request: MatchRequest) -> List[MatchResult]:
    """Find and rank the top 3 volunteer matches for a community need.

    Uses multi-factor scoring: skill match (50%), proximity (30%),
    and reliability (20%).
    """
    need_ref = (
        db.collection("organizations")
        .document(request.org_id)
        .collection("needs")
        .document(request.need_id)
    )
    need_doc = need_ref.get()

    if not need_doc.exists:
        raise HTTPException(
            status_code=404,
            detail=f"Need {request.need_id} not found in organization {request.org_id}.",
        )

    need_data = _need_doc_to_dict(need_doc.id, need_doc.to_dict())

    volunteers_ref = (
        db.collection("organizations")
        .document(request.org_id)
        .collection("volunteers")
        .where("availability", "==", True)
    )
    volunteer_docs = volunteers_ref.stream()
    volunteers = [
        _volunteer_doc_to_dict(doc.id, doc.to_dict()) for doc in volunteer_docs
    ]

    if not volunteers:
        raise HTTPException(
            status_code=404,
            detail="No available volunteers found.",
        )

    matches = match_volunteers(need_data, volunteers)

    results = []
    for match in matches:
        vol_data = match["volunteer"]
        volunteer = Volunteer(
            id=vol_data.get("id"),
            name=vol_data.get("name", "Unknown"),
            skills=vol_data.get("skills", []),
            skill_description=vol_data.get("skill_description", ""),
            location=vol_data.get("location", {"lat": 0, "lng": 0, "zone": "Unknown"}),
            availability=vol_data.get("availability", True),
            completion_rate=vol_data.get("completion_rate", 1.0),
            avg_response_minutes=vol_data.get("avg_response_minutes", 10.0),
            tasks_completed=vol_data.get("tasks_completed", 0),
            fcm_token=vol_data.get("fcm_token"),
        )
        results.append(
            MatchResult(
                volunteer=volunteer,
                skill_score=match["skill_score"],
                proximity_score=match["proximity_score"],
                reliability_score=match["reliability_score"],
                final_score=match["final_score"],
                travel_minutes=match["travel_minutes"],
                reasoning=match["reasoning"],
            )
        )

    return results


@app.post("/assign")
async def assign_volunteer(request: AssignRequest) -> Dict:
    """Assign a volunteer to a community need.

    Updates Firestore documents for both the need and volunteer,
    sends an FCM notification, and creates an assignment record.
    """
    need_ref = (
        db.collection("organizations")
        .document(request.org_id)
        .collection("needs")
        .document(request.need_id)
    )
    need_doc = need_ref.get()
    if not need_doc.exists:
        raise HTTPException(status_code=404, detail=f"Need {request.need_id} not found.")

    vol_ref = (
        db.collection("organizations")
        .document(request.org_id)
        .collection("volunteers")
        .document(request.volunteer_id)
    )
    vol_doc = vol_ref.get()
    if not vol_doc.exists:
        raise HTTPException(
            status_code=404, detail=f"Volunteer {request.volunteer_id} not found."
        )

    need_ref.update({"status": "assigned"})
    vol_ref.update({"availability": False})

    vol_data = vol_doc.to_dict()
    need_data = need_doc.to_dict()
    need_data["id"] = request.need_id

    fcm_token = vol_data.get("fcm_token")
    notification_sent = False
    if fcm_token:
        notification_sent = send_task_notification(fcm_token, need_data, 0.95)

    assignment_ref = (
        db.collection("organizations")
        .document(request.org_id)
        .collection("assignments")
        .document()
    )
    assignment_data = {
        "need_id": request.need_id,
        "volunteer_id": request.volunteer_id,
        "assigned_at": datetime.now(timezone.utc).isoformat(),
        "status": "assigned",
        "notification_sent": notification_sent,
    }
    assignment_ref.set(assignment_data)

    return {
        "success": True,
        "assignment_id": assignment_ref.id,
        "notification_sent": notification_sent,
    }


@app.get("/crisis-report/{org_id}", response_model=CrisisReport)
async def get_crisis_report(org_id: str) -> CrisisReport:
    """Generate an AI-powered crisis situation report from active needs.

    Requires at least 3 active (unassigned) needs to produce a meaningful report.
    """
    needs_ref = (
        db.collection("organizations")
        .document(org_id)
        .collection("needs")
        .where("status", "==", "unassigned")
    )
    need_docs = needs_ref.stream()
    needs = [_need_doc_to_dict(doc.id, doc.to_dict()) for doc in need_docs]

    if len(needs) < 3:
        raise HTTPException(
            status_code=400,
            detail="Not enough active needs for report. At least 3 unassigned needs required.",
        )

    report_data = generate_crisis_report(needs)

    return CrisisReport(
        zone=report_data.get("zone", "Unknown"),
        total_needs=report_data.get("total_needs", len(needs)),
        critical_needs=report_data.get("critical_needs", 0),
        skill_gaps=report_data.get("skill_gaps", []),
        recommended_actions=report_data.get("recommended_actions", []),
        predicted_escalation=report_data.get(
            "predicted_escalation", "Unable to predict."
        ),
        generated_at=datetime.now(timezone.utc),
    )


@app.get("/needs/{org_id}", response_model=List[CommunityNeed])
async def get_needs(org_id: str) -> List[CommunityNeed]:
    """Fetch all community needs for an organization, sorted by urgency."""
    needs_ref = (
        db.collection("organizations")
        .document(org_id)
        .collection("needs")
        .order_by("urgency_score", direction=firestore.Query.DESCENDING)
    )
    need_docs = needs_ref.stream()

    needs: List[CommunityNeed] = []
    for doc in need_docs:
        data = doc.to_dict()
        needs.append(
            CommunityNeed(
                id=doc.id,
                need_type=data.get("need_type", "Unknown"),
                urgency_score=data.get("urgency_score", 5),
                required_skills=data.get("required_skills", []),
                location=data.get("location", {"lat": 0, "lng": 0, "zone": "Unknown"}),
                volunteer_hours_needed=data.get("volunteer_hours_needed", 0),
                confidence_score=data.get("confidence_score"),
                raw_text=data.get("raw_text"),
                status=data.get("status", "unassigned"),
                org_id=org_id,
                created_at=data.get("created_at"),
            )
        )

    return needs


@app.get("/volunteers/{org_id}", response_model=List[Volunteer])
async def get_volunteers(org_id: str) -> List[Volunteer]:
    """Fetch all volunteers registered under an organization."""
    vol_ref = (
        db.collection("organizations")
        .document(org_id)
        .collection("volunteers")
    )
    vol_docs = vol_ref.stream()

    volunteers: List[Volunteer] = []
    for doc in vol_docs:
        data = doc.to_dict()
        volunteers.append(
            Volunteer(
                id=doc.id,
                name=data.get("name", "Unknown"),
                skills=data.get("skills", []),
                skill_description=data.get("skill_description", ""),
                location=data.get("location", {"lat": 0, "lng": 0, "zone": "Unknown"}),
                availability=data.get("availability", True),
                completion_rate=data.get("completion_rate", 1.0),
                avg_response_minutes=data.get("avg_response_minutes", 10.0),
                tasks_completed=data.get("tasks_completed", 0),
                fcm_token=data.get("fcm_token"),
            )
        )

    return volunteers
