import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RaastaSafe"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "raastasafe_secret_jwt_key_2026_delhi_transit")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./raastasafe.db")

    # Pilot Station Defaults (Rohini West Metro Station)
    DEFAULT_STATION_NAME: str = "Rohini West Metro Station"
    DEFAULT_STATION_CODE: str = "RWST"
    DEFAULT_STATION_LAT: float = 28.71452
    DEFAULT_STATION_LNG: float = 77.11475
    DEFAULT_AUDIT_RADIUS_M: float = 500.0
    DEFAULT_CATCHMENT_RADIUS_M: float = 800.0

    # IRC:103-2022 Guidelines Configuration
    IRC_MIN_WALKING_ZONE_GENERAL_M: float = 2.0
    IRC_MIN_WALKING_ZONE_TRANSIT_M: float = 2.5
    IRC_MAX_IPT_STAND_DISTANCE_M: float = 100.0
    IRC_CROSSING_INTERVAL_MIN_M: float = 80.0
    IRC_CROSSING_INTERVAL_MAX_M: float = 150.0

    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE_MB: int = 5

    class Config:
        case_sensitive = True

settings = Settings()
