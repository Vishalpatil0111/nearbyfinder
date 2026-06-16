from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ServiceCreate(BaseModel):
    name: str = Field(..., example="City Hospital")
    category: str = Field(..., example="hospital")
    latitude: float = Field(..., example=19.0728)
    longitude: float = Field(..., example=72.8826)
    rating: Optional[float] = Field(None, example=4.5)


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, example="City Hospital Updated")
    category: Optional[str] = Field(None, example="hospital")
    latitude: Optional[float] = Field(None, example=19.0728)
    longitude: Optional[float] = Field(None, example=72.8826)
    rating: Optional[float] = Field(None, example=4.6)


class ServiceOut(BaseModel):
    id: int
    name: str
    category: str
    latitude: float
    longitude: float
    rating: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class ServiceNearbyOut(ServiceOut):
    distance_km: float = Field(..., example=0.853)


class AdminLogin(BaseModel):
    username: str = Field(..., example="admingis")
    password: str = Field(..., example="admingis123")


class Token(BaseModel):
    access_token: str
    token_type: str = Field(default="bearer")
