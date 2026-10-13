from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import CrashContext
from backend.app.schemas import CrashContextOut

router = APIRouter(prefix="/crashes", tags=["Official Crash Context"])

@router.get("", response_model=List[CrashContextOut])
def get_crash_context(db: Session = Depends(get_db)):
    """
    Returns official macro-corridor crash statistics from Delhi Traffic Police reports.
    Notice: Does NOT synthesize micro point-level crash coordinates around Rohini West.
    """
    return db.query(CrashContext).all()
