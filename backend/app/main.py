from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.database import supabase
from app.auth import hash_password
from app.routers import auth, services


@asynccontextmanager
async def lifespan(app: FastAPI):
    res = supabase.table("admins").select("id").eq("username", "admingis").execute()
    if not res.data:
        supabase.table("admins").insert({
            "username": "admingis",
            "hashed_password": hash_password("admingis123")
        }).execute()
    yield


app = FastAPI(
    title="NearbyFinder API",
    description="Geospatial nearby services API using PostGIS. Find hospitals, ATMs, shops and more.",
    version="1.0.0",
    lifespan=lifespan,
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    for path in schema["paths"].values():
        for method in path.values():
            if "security" in method:
                method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://nearbyfinder-seven.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "NearbyFinder API", "docs": "/docs", "version": "1.0.0"}
