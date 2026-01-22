
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import api
from .database import engine  # Keep engine for DB connection check if needed, but DO NOT import Base to create_all
import os
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Itqan Enterprise API", version="2.2.0")

# Security: CORS Hardening
# Strict origin check required for credentials. No "*" allowed.
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Enterprise Server Error. Contact Admin."},
    )

# NOTE: Base.metadata.create_all(bind=engine) REMOVED.
# Use Alembic for migrations in production.

app.include_router(api.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "mode": "production"}
