import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from backend.app.config import settings

router = APIRouter(prefix="/uploads", tags=["File Uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@router.post("")
async def upload_evidence_photo(file: UploadFile = File(...)):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed extensions: {list(ALLOWED_EXTENSIONS)}"
        )

    # Read and check size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Generate sanitized unique filename
    safe_filename = f"evidence_{uuid.uuid4().hex}{ext}"
    target_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(target_path, "wb") as f:
        f.write(contents)

    return {
        "filename": safe_filename,
        "url": f"/uploads/{safe_filename}",
        "size_bytes": len(contents)
    }
