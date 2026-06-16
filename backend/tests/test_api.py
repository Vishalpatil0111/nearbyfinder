"""
Unit tests for NearbyFinder backend.
Uses FastAPI TestClient with mocked Supabase so no real DB calls are made.
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.auth import hash_password, verify_password, create_access_token

client = TestClient(app)

# ─────────────────────────────────────────────
# Auth utility tests
# ─────────────────────────────────────────────

class TestAuthUtils:
    def test_hash_and_verify_password(self):
        hashed = hash_password("admingis123")
        assert verify_password("admingis123", hashed) is True
        assert verify_password("wrongpass", hashed) is False

    def test_create_access_token_returns_string(self):
        token = create_access_token({"sub": "admingis"})
        assert isinstance(token, str)
        assert len(token) > 10

    def test_token_contains_subject(self):
        from jose import jwt
        import os
        token = create_access_token({"sub": "admingis"})
        payload = jwt.decode(token, os.getenv("JWT_SECRET", "supersecretkey123"), algorithms=["HS256"])
        assert payload["sub"] == "admingis"


# ─────────────────────────────────────────────
# Auth API tests
# ─────────────────────────────────────────────

class TestAuthEndpoints:
    def test_login_success(self):
        mock_admin = {"id": 1, "username": "admingis", "hashed_password": hash_password("admingis123")}
        with patch("app.routers.auth.supabase") as mock_sb:
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            res = client.post("/auth/login", json={"username": "admingis", "password": "admingis123"})
        assert res.status_code == 200
        assert "access_token" in res.json()
        assert res.json()["token_type"] == "bearer"

    def test_login_wrong_password(self):
        mock_admin = {"id": 1, "username": "admingis", "hashed_password": hash_password("admingis123")}
        with patch("app.routers.auth.supabase") as mock_sb:
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            res = client.post("/auth/login", json={"username": "admingis", "password": "wrongpass"})
        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid credentials"

    def test_login_user_not_found(self):
        with patch("app.routers.auth.supabase") as mock_sb:
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            res = client.post("/auth/login", json={"username": "nobody", "password": "pass"})
        assert res.status_code == 401

    def test_login_missing_fields(self):
        res = client.post("/auth/login", json={"username": "admingis"})
        assert res.status_code == 422  # Unprocessable Entity


# ─────────────────────────────────────────────
# Services — Public endpoints
# ─────────────────────────────────────────────

MOCK_SERVICE = {
    "id": 1, "name": "City Hospital", "category": "hospital",
    "latitude": 19.0728, "longitude": 72.8826, "rating": 4.5,
    "created_at": "2025-06-16T10:00:00+00:00"
}

MOCK_NEARBY = {**MOCK_SERVICE, "distance_km": 0.5}


class TestServicesPublic:
    def test_get_all_services(self):
        with patch("app.routers.services.supabase") as mock_sb:
            mock_sb.table.return_value.select.return_value.execute.return_value = MagicMock(data=[MOCK_SERVICE])
            res = client.get("/services")
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert res.json()[0]["name"] == "City Hospital"

    def test_get_services_with_category_filter(self):
        with patch("app.routers.services.supabase") as mock_sb:
            execute_mock = MagicMock(data=[MOCK_SERVICE])
            mock_sb.table.return_value.select.return_value.ilike.return_value.execute.return_value = execute_mock
            res = client.get("/services?category=hospital")
        assert res.status_code == 200

    def test_get_single_service(self):
        with patch("app.routers.services.supabase") as mock_sb:
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[MOCK_SERVICE])
            res = client.get("/services/1")
        assert res.status_code == 200
        assert res.json()["id"] == 1

    def test_get_single_service_not_found(self):
        with patch("app.routers.services.supabase") as mock_sb:
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            res = client.get("/services/9999")
        assert res.status_code == 404
        assert res.json()["detail"] == "Service not found"

    def test_nearby_search(self):
        with patch("app.routers.services.supabase") as mock_sb:
            mock_sb.rpc.return_value.execute.return_value = MagicMock(data=[MOCK_NEARBY])
            res = client.get("/services/nearby?lat=19.0728&lng=72.8826&radius_km=5")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert data[0]["distance_km"] == 0.5

    def test_nearby_search_missing_params(self):
        res = client.get("/services/nearby?lat=19.0728")
        assert res.status_code == 422

    def test_nearby_search_with_category(self):
        with patch("app.routers.services.supabase") as mock_sb:
            mock_sb.rpc.return_value.execute.return_value = MagicMock(data=[MOCK_NEARBY])
            res = client.get("/services/nearby?lat=19.0728&lng=72.8826&radius_km=5&category=hospital")
        assert res.status_code == 200


# ─────────────────────────────────────────────
# Services — Admin endpoints (require JWT)
# ─────────────────────────────────────────────

def get_auth_header():
    """Helper: get valid JWT header."""
    token = create_access_token({"sub": "admingis"})
    return {"Authorization": f"Bearer {token}"}


class TestServicesAdmin:
    def test_create_service_unauthorized(self):
        res = client.post("/services", json={"name": "Test", "category": "hospital", "latitude": 19.0, "longitude": 72.8})
        assert res.status_code == 401

    def test_create_service_authorized(self):
        mock_admin = {"id": 1, "username": "admingis"}
        new_service = {**MOCK_SERVICE, "id": 2, "name": "New Clinic"}
        with patch("app.auth.supabase") as auth_sb, \
             patch("app.routers.services.supabase") as svc_sb:
            auth_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            svc_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[new_service])
            res = client.post(
                "/services",
                json={"name": "New Clinic", "category": "hospital", "latitude": 19.0, "longitude": 72.8, "rating": 4.0},
                headers=get_auth_header()
            )
        assert res.status_code == 200
        assert res.json()["name"] == "New Clinic"

    def test_update_service_authorized(self):
        mock_admin = {"id": 1, "username": "admingis"}
        updated = {**MOCK_SERVICE, "name": "Updated Hospital"}
        with patch("app.auth.supabase") as auth_sb, \
             patch("app.routers.services.supabase") as svc_sb:
            auth_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            svc_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[updated])
            res = client.put(
                "/services/1",
                json={"name": "Updated Hospital"},
                headers=get_auth_header()
            )
        assert res.status_code == 200
        assert res.json()["name"] == "Updated Hospital"

    def test_update_service_not_found(self):
        mock_admin = {"id": 1, "username": "admingis"}
        with patch("app.auth.supabase") as auth_sb, \
             patch("app.routers.services.supabase") as svc_sb:
            auth_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            svc_sb.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            res = client.put("/services/9999", json={"name": "X"}, headers=get_auth_header())
        assert res.status_code == 404

    def test_delete_service_authorized(self):
        mock_admin = {"id": 1, "username": "admingis"}
        with patch("app.auth.supabase") as auth_sb, \
             patch("app.routers.services.supabase") as svc_sb:
            auth_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            svc_sb.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock(data=[MOCK_SERVICE])
            res = client.delete("/services/1", headers=get_auth_header())
        assert res.status_code == 200
        assert res.json()["detail"] == "Service deleted"

    def test_delete_service_unauthorized(self):
        res = client.delete("/services/1")
        assert res.status_code == 401

    def test_delete_service_not_found(self):
        mock_admin = {"id": 1, "username": "admingis"}
        with patch("app.auth.supabase") as auth_sb, \
             patch("app.routers.services.supabase") as svc_sb:
            auth_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            svc_sb.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            res = client.delete("/services/9999", headers=get_auth_header())
        assert res.status_code == 404

    def test_update_no_fields(self):
        mock_admin = {"id": 1, "username": "admingis"}
        with patch("app.auth.supabase") as auth_sb:
            auth_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[mock_admin])
            res = client.put("/services/1", json={}, headers=get_auth_header())
        assert res.status_code == 400


# ─────────────────────────────────────────────
# Schema validation tests
# ─────────────────────────────────────────────

class TestSchemas:
    def test_service_create_valid(self):
        from app.schemas import ServiceCreate
        s = ServiceCreate(name="Test", category="hospital", latitude=19.0, longitude=72.8)
        assert s.rating is None

    def test_service_create_with_rating(self):
        from app.schemas import ServiceCreate
        s = ServiceCreate(name="Test", category="atm", latitude=19.0, longitude=72.8, rating=4.2)
        assert s.rating == 4.2

    def test_service_update_all_optional(self):
        from app.schemas import ServiceUpdate
        s = ServiceUpdate()
        assert s.name is None
        assert s.category is None

    def test_admin_login_schema(self):
        from app.schemas import AdminLogin
        a = AdminLogin(username="admingis", password="admingis123")
        assert a.username == "admingis"


# ─────────────────────────────────────────────
# Root endpoint
# ─────────────────────────────────────────────

class TestRoot:
    def test_root(self):
        res = client.get("/")
        assert res.status_code == 200
        assert "NearbyFinder" in res.json()["message"]
