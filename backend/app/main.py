import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.api.endpoints import (
    auth, stations, footpaths, queues, crossings, hazards,
    surveys, planning, routes, analytics, crashes, exports, uploads
)

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RaastaSafe — Metro-Area Pedestrian Audit and Last-Mile Mobility Planner API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API v1 Routers directly with prefix so dependencies propagate properly
prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=prefix)
app.include_router(stations.router, prefix=prefix)
app.include_router(footpaths.router, prefix=prefix)
app.include_router(queues.router, prefix=prefix)
app.include_router(crossings.router, prefix=prefix)
app.include_router(hazards.router, prefix=prefix)
app.include_router(surveys.router, prefix=prefix)
app.include_router(planning.router, prefix=prefix)
app.include_router(routes.router, prefix=prefix)
app.include_router(analytics.router, prefix=prefix)
app.include_router(crashes.router, prefix=prefix)
app.include_router(exports.router, prefix=prefix)
app.include_router(uploads.router, prefix=prefix)

@app.get("/")
def root():
    return {
        "project": "RaastaSafe",
        "description": "Metro-Area Pedestrian Audit and Last-Mile Mobility Planner",
        "pilot_station": "Rohini West Metro Station (Red Line)",
        "guideline_standards": ["IRC:103-2022", "WRI India 2023", "UTTIPEC MMI"],
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "raastasafe-backend"}
