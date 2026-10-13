from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import CommuterSurvey, Station
from backend.app.schemas import (
    CommuterSurveyCreate, CommuterSurveyOut, IPAResultsOut
)
from backend.app.algorithms.ipa_engine import IPAEngine

router = APIRouter(prefix="/surveys", tags=["Commuter Surveys & IPA"])

@router.post("", response_model=CommuterSurveyOut, status_code=status.HTTP_201_CREATED)
def submit_commuter_survey(
    survey_in: CommuterSurveyCreate,
    db: Session = Depends(get_db)
):
    # Convert Pydantic responses to JSON dict
    raw_responses = {
        k: {"importance": v.importance, "satisfaction": v.satisfaction}
        for k, v in survey_in.responses.items()
    }
    survey = CommuterSurvey(
        station_id=survey_in.station_id,
        responses_json=raw_responses,
        commuter_type=survey_in.commuter_type,
        gender=survey_in.gender,
        notes=survey_in.notes
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return survey

@router.get("/ipa", response_model=IPAResultsOut)
def get_ipa_results(
    station_id: int = 1,
    db: Session = Depends(get_db)
):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    surveys = db.query(CommuterSurvey).filter(
        CommuterSurvey.station_id == station_id
    ).all()

    ipa_data = IPAEngine.analyze_surveys(surveys, station_id=station_id)
    return ipa_data
