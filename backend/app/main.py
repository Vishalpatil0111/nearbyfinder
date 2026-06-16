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
    description="""
## Nearby Services Finder — Geospatial API

Find hospitals, ATMs, shops and other services near any location using **PostGIS spatial queries**.

### Authentication
Admin endpoints require a **Bearer JWT token**.
1. Call `POST /auth/login` with `admingis / admingis123`
2. Copy the `access_token` from the response
3. Click **Authorize** above and paste the token

### Public Endpoints
- `GET /services` — List all services (optional category filter)
- `GET /services/nearby` — Radius search using PostGIS ST_DWithin
- `GET /services/{id}` — Get a single service

### Admin Endpoints (JWT required)
- `POST /services` — Add a service
- `PUT /services/{id}` — Update a service
- `DELETE /services/{id}` — Delete a service

### Categories
`hospital` | `atm` | `shop` | `others`

### Sample Nearby Search
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=5
```
""",
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "NearbyFinder API", "docs": "/docs", "version": "1.0.0"}
