import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import health, mono, prembly, screenings

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tentrust-api")

app = FastAPI(
    title="TenTrust Verification API",
    description="FastAPI Backend for Mono Credit History Lookup & Prembly KYC/Background Checks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health.router)
app.include_router(mono.router)
app.include_router(prembly.router)
app.include_router(screenings.router)


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting TenTrust API in {settings.ENVIRONMENT} mode...")
    logger.info("Mono Credit Check & Prembly KYC modules loaded.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )
