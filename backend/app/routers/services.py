from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.database import supabase
from app import schemas
from app.auth import get_current_admin

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=List[schemas.ServiceOut], summary="Get all services", description="Returns all services. Filter by category using the `category` query parameter.")
def get_services(category: Optional[str] = Query(None, example="hospital")):
    query = supabase.table("services").select("*")
    if category:
        query = query.ilike("category", category)
    return query.execute().data


@router.get("/nearby", response_model=List[schemas.ServiceNearbyOut], summary="Nearby search", description="Returns services within the given radius (km) sorted by distance. Uses PostGIS ST_DWithin.")
def get_nearby(
    lat: float = Query(..., example=19.0728, description="Latitude of search center"),
    lng: float = Query(..., example=72.8826, description="Longitude of search center"),
    radius_km: float = Query(..., example=5.0, description="Search radius in kilometers"),
    category: Optional[str] = Query(None, example="hospital"),
):
    params = {"user_lat": lat, "user_lng": lng, "radius_km": radius_km, "filter_category": category}
    return supabase.rpc("get_nearby_services", params).execute().data


@router.get("/{service_id}", response_model=schemas.ServiceOut, summary="Get service by ID")
def get_service(service_id: int):
    res = supabase.table("services").select("*").eq("id", service_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Service not found")
    return res.data[0]


@router.post("", response_model=schemas.ServiceOut, summary="Add service (Admin)", description="Creates a new service. Requires Bearer token.")
def create_service(payload: schemas.ServiceCreate, _=Depends(get_current_admin)):
    res = supabase.table("services").insert(payload.model_dump()).execute()
    return res.data[0]


@router.put("/{service_id}", response_model=schemas.ServiceOut, summary="Update service (Admin)", description="Updates an existing service. All fields optional. Requires Bearer token.")
def update_service(service_id: int, payload: schemas.ServiceUpdate, _=Depends(get_current_admin)):
    data = payload.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase.table("services").update(data).eq("id", service_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Service not found")
    return res.data[0]


@router.delete("/{service_id}", summary="Delete service (Admin)", description="Deletes a service by ID. Requires Bearer token.")
def delete_service(service_id: int, _=Depends(get_current_admin)):
    res = supabase.table("services").delete().eq("id", service_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"detail": "Service deleted"}
