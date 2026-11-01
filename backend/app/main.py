from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import hmac
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .config import settings
from .database import engine
from .routers import auth_router, user_router, admin_router, scan_router

MAX_REQUEST_BYTES = 8 * 1024 * 1024

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ScamShield Nepal API. URL checks are local and never fetch the submitted destination.",
    docs_url=None if settings.ENVIRONMENT.lower() in {"production", "prod"} else "/docs",
    redoc_url=None if settings.ENVIRONMENT.lower() in {"production", "prod"} else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
    max_age=600,
)


@app.middleware("http")
async def enforce_request_size(request: Request, call_next):
    length = request.headers.get("content-length")
    if length:
        try:
            if int(length) > MAX_REQUEST_BYTES:
                return JSONResponse(status_code=413, content={"detail": "Request exceeds the 8 MB limit."})
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Invalid Content-Length header."})
    if request.method not in {"GET", "HEAD", "OPTIONS"} and request.cookies.get("scamshield_session") and not request.headers.get("authorization"):
        cookie_token = request.cookies.get("scamshield_csrf", "")
        header_token = request.headers.get("x-csrf-token", "")
        if not cookie_token or not header_token or not hmac.compare_digest(cookie_token, header_token):
            return JSONResponse(status_code=403, content={"detail": "CSRF validation failed. Refresh the page and try again."})
    return await call_next(request)


# Preserve existing root-level API paths used by the deployed React client and
# expose versioned aliases for future clients.
for api_router in (auth_router.router, user_router.router, admin_router.router, scan_router.router):
    app.include_router(api_router, prefix="/api/v1")
    app.include_router(api_router)


@app.get("/")
def root():
    return {"status": "online", "app": settings.PROJECT_NAME, "version": settings.VERSION}


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(status_code=503, content={"status": "unavailable", "database": "disconnected"})
    return {"status": "healthy", "database": "connected"}
