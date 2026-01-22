
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Production Security: Require DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    # Allow SQLite only if explicitly in DEV mode, otherwise fail
    if os.getenv("ENV") == "DEVELOPMENT":
        SQLALCHEMY_DATABASE_URL = "sqlite:///./itqan.db"
    else:
        raise ValueError("FATAL: DATABASE_URL is not set. Cannot start in Production mode.")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
