# NearbyFinder — Full-Stack Geo Application

A full-stack geospatial application that allows users to discover nearby services (hospitals, ATMs, shops, and more) on an interactive map. Built with **FastAPI** + **Next.js** + **PostgreSQL/PostGIS** (via Supabase).

---

## Live Demo

| | URL |
|---|---|
| Frontend | https://nearbyfinder-seven.vercel.app |
| Backend API | https://nearbyfinder-akb2.onrender.com |
| Swagger Docs | https://nearbyfinder-akb2.onrender.com/docs |

### Admin Credentials
| Field | Value |
|---|---|
| Username | `admingis` |
| Password | `admingis123` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.12 |
| Database | PostgreSQL + PostGIS (Supabase) |
| DB Client | supabase-py |
| Authentication | JWT (python-jose + passlib) |
| Frontend | Next.js 15 (App Router, JS) |
| Map | OpenLayers (ol) + OpenStreetMap |
| API Docs | Swagger UI (FastAPI auto-generated) |

---

## Project Structure

```
GISAPP/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── schemas.py
│   │   └── routers/
│   │       ├── auth.py
│   │       └── services.py
│   ├── tests/
│   │   └── test_api.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js
│   │   │   ├── nearby/page.js
│   │   │   ├── services/page.js
│   │   │   └── admin/
│   │   │       ├── login/page.js
│   │   │       └── dashboard/page.js
│   │   ├── components/
│   │   │   ├── Map.js
│   │   │   └── Navbar.js
│   │   └── lib/
│   │       ├── api.js
│   │       └── categories.js
│   └── .env.local
└── README.md
```

---

## Quick Test Cases

Use these to verify the application is working after setup. All examples use the Ashok Nagar, Mumbai sample data.

### Sample Coordinates for Testing

| Location | Latitude | Longitude |
|---|---|---|
| Ashok Nagar, Mumbai (center) | `19.0728` | `72.8826` |
| Chembur, Mumbai | `19.0627` | `72.8993` |
| Ghatkopar, Mumbai | `19.0863` | `72.9082` |

**Recommended test input:**
```
Latitude  : 19.0728
Longitude : 72.8826
Radius    : 5
```
Paste these directly into the Nearby Search page or Swagger to get results.

---

### Nearby Search — Test Cases

#### 1. Search all services within 5 km
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=5
```
Expected: Returns 20 services sorted by distance, each with `distance_km` field.

#### 2. Search hospitals only within 5 km
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=5&category=hospital
```
Expected: Returns only hospital services (5 results) sorted by nearest first.

#### 3. Search ATMs within 2 km (tight radius)
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=2&category=atm
```
Expected: Returns ATMs within 2 km — should include SBI ATM, HDFC ATM, ICICI ATM.

#### 4. Search shops within 1 km (very tight)
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=1&category=shop
```
Expected: Returns only shops within 1 km radius — D-Mart Kurla and Reliance Fresh should appear.

#### 5. Search with zero results (radius too small)
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=0.1
```
Expected: Returns empty array `[]` — no services within 100 meters.

#### 6. Search at different center (Chembur area)
```
GET /services/nearby?lat=19.0627&lng=72.8993&radius_km=3
```
Expected: Returns services near Chembur — Bank of India ATM, More Supermarket, Petrol Pump HP Chembur.

#### 7. Missing required parameter
```
GET /services/nearby?lat=19.0728
```
Expected: `422 Unprocessable Entity` — lng and radius_km are required.

---

### Auth — Test Cases

#### 8. Valid login
```json
POST /auth/login
{ "username": "admingis", "password": "admingis123" }
```
Expected: `200 OK` with `access_token` and `token_type: "bearer"`.

#### 9. Wrong password
```json
POST /auth/login
{ "username": "admingis", "password": "wrongpass" }
```
Expected: `401 Unauthorized` with `"detail": "Invalid credentials"`.

#### 10. Non-existent user
```json
POST /auth/login
{ "username": "unknown", "password": "pass" }
```
Expected: `401 Unauthorized`.

---

### Services CRUD — Test Cases

#### 11. Get all services
```
GET /services
```
Expected: Array of 20 service objects.

#### 12. Filter by category
```
GET /services?category=hospital
```
Expected: Only hospital services.

#### 13. Get single service
```
GET /services/1
```
Expected: Single service object with id=1.

#### 14. Get non-existent service
```
GET /services/9999
```
Expected: `404 Not Found` with `"detail": "Service not found"`.

#### 15. Create service without token (unauthorized)
```json
POST /services
{ "name": "Test", "category": "hospital", "latitude": 19.07, "longitude": 72.88 }
```
Expected: `401 Unauthorized`.

#### 16. Create service with valid token
```json
POST /services  [Bearer token required]
{
  "name": "Apollo Clinic",
  "category": "hospital",
  "latitude": 19.0750,
  "longitude": 72.8840,
  "rating": 4.3
}
```
Expected: `200 OK` with created service object including `id` and `created_at`.

#### 17. Update service rating
```json
PUT /services/1  [Bearer token required]
{ "rating": 4.8 }
```
Expected: `200 OK` with updated service object.

#### 18. Delete service
```
DELETE /services/1  [Bearer token required]
```
Expected: `200 OK` with `{ "detail": "Service deleted" }`.

---

### Running Unit Tests

```bash
cd backend
source venv/bin/activate
python -m pytest tests/test_api.py -v
```

Expected output: **27 passed**

```
TestAuthUtils::test_hash_and_verify_password PASSED
TestAuthUtils::test_create_access_token_returns_string PASSED
TestAuthUtils::test_token_contains_subject PASSED
TestAuthEndpoints::test_login_success PASSED
TestAuthEndpoints::test_login_wrong_password PASSED
TestAuthEndpoints::test_login_user_not_found PASSED
TestAuthEndpoints::test_login_missing_fields PASSED
TestServicesPublic::test_get_all_services PASSED
TestServicesPublic::test_get_services_with_category_filter PASSED
TestServicesPublic::test_get_single_service PASSED
TestServicesPublic::test_get_single_service_not_found PASSED
TestServicesPublic::test_nearby_search PASSED
TestServicesPublic::test_nearby_search_missing_params PASSED
TestServicesPublic::test_nearby_search_with_category PASSED
TestServicesAdmin::test_create_service_unauthorized PASSED
TestServicesAdmin::test_create_service_authorized PASSED
TestServicesAdmin::test_update_service_authorized PASSED
TestServicesAdmin::test_update_service_not_found PASSED
TestServicesAdmin::test_delete_service_authorized PASSED
TestServicesAdmin::test_delete_service_unauthorized PASSED
TestServicesAdmin::test_delete_service_not_found PASSED
TestServicesAdmin::test_update_no_fields PASSED
TestSchemas::test_service_create_valid PASSED
TestSchemas::test_service_create_with_rating PASSED
TestSchemas::test_service_update_all_optional PASSED
TestSchemas::test_admin_login_schema PASSED
TestRoot::test_root PASSED
```

---

## Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)

---

### 1. Supabase Database Setup

1. Create a new Supabase project
2. Go to **SQL Editor** and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    rating FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
);

CREATE OR REPLACE FUNCTION get_nearby_services(
    user_lat FLOAT,
    user_lng FLOAT,
    radius_km FLOAT,
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id INT, name TEXT, category TEXT,
    latitude FLOAT, longitude FLOAT,
    rating FLOAT, created_at TIMESTAMPTZ, distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.category, s.latitude, s.longitude, s.rating, s.created_at,
        CAST(
            ST_Distance(
                ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
                ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
            ) / 1000 AS FLOAT
        ) AS distance_km
    FROM services s
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_km * 1000
    )
    AND (filter_category IS NULL OR LOWER(s.category) = LOWER(filter_category))
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

3. Go to **Settings → API** and copy:
   - **Project URL** → `https://xxxx.supabase.co`
   - **service_role key** → long JWT string

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-strong-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Start the server:

```bash
uvicorn app.main:app --reload
```

Server starts at `http://localhost:8000`. Admin `admingis / admingis123` is auto-seeded on first startup.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

### 4. Sample Data

Insert test data via Supabase SQL Editor (Ashok Nagar, Mumbai area):

```sql
INSERT INTO services (name, category, latitude, longitude, rating) VALUES
('Ashok Nagar Municipal Hospital', 'hospital', 19.0728, 72.8826, 4.2),
('Sion Hospital', 'hospital', 19.0392, 72.8619, 4.5),
('KEM Hospital', 'hospital', 19.0007, 72.8407, 4.7),
('Rajawadi Hospital', 'hospital', 19.0821, 72.8956, 4.1),
('Kurla Maternity Home', 'hospital', 19.0726, 72.8796, 3.9),
('SBI ATM Ashok Nagar', 'atm', 19.0735, 72.8831, 3.8),
('HDFC ATM Kurla West', 'atm', 19.0712, 72.8801, 4.0),
('ICICI ATM LBS Marg', 'atm', 19.0698, 72.8774, 4.1),
('Axis Bank ATM Ghatkopar', 'atm', 19.0863, 72.9082, 3.7),
('Bank of India ATM Chembur', 'atm', 19.0627, 72.8993, 3.9),
('D-Mart Kurla', 'shop', 19.0721, 72.8812, 4.4),
('Reliance Fresh Ashok Nagar', 'shop', 19.0741, 72.8845, 4.2),
('Big Bazaar Ghatkopar', 'shop', 19.0868, 72.9071, 4.3),
('More Supermarket Chembur', 'shop', 19.0619, 72.8981, 3.8),
('Star Bazaar Sion', 'shop', 19.0401, 72.8631, 4.0),
('Ashok Nagar Post Office', 'others', 19.0733, 72.8829, 3.6),
('Kurla Railway Station', 'others', 19.0706, 72.8794, 4.3),
('Petrol Pump HP Chembur', 'others', 19.0641, 72.8997, 3.9),
('Ashok Nagar Police Chowki', 'others', 19.0729, 72.8833, 4.0),
('LPG Gas Agency Kurla', 'others', 19.0718, 72.8808, 3.7);
```

---

## API Documentation (Swagger)

Visit `http://localhost:8000/docs` for interactive Swagger UI.

### How to use Swagger with Auth

1. Call `POST /auth/login` → click **Try it out** → **Execute**
2. Copy the `access_token` value from the response
3. Click **Authorize** (top right of Swagger page)
4. Paste the token in the **Value** field → click **Authorize**
5. All admin endpoints are now accessible

---

## API Reference

### Auth

#### `POST /auth/login`
```json
Request:
{ "username": "admingis", "password": "admingis123" }

Response 200:
{ "access_token": "eyJhbGci...", "token_type": "bearer" }

Response 401:
{ "detail": "Invalid credentials" }
```

### Services (Public)

#### `GET /services`
```
GET /services
GET /services?category=hospital
GET /services?category=atm
GET /services?category=shop
GET /services?category=others
```

#### `GET /services/nearby`
```
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=5
GET /services/nearby?lat=19.0728&lng=72.8826&radius_km=2&category=hospital
```

Response includes `distance_km` field sorted by nearest.

#### `GET /services/{id}`
```
GET /services/1
```

### Services (Admin — Bearer token required)

#### `POST /services`
```json
{
  "name": "Apollo Clinic",
  "category": "hospital",
  "latitude": 19.0750,
  "longitude": 72.8840,
  "rating": 4.3
}
```

#### `PUT /services/{id}`
```json
{ "name": "Apollo Clinic Updated", "rating": 4.6 }
```

#### `DELETE /services/{id}`
```
Response 200: { "detail": "Service deleted" }
```

---

## Deployment

### Backend — Render (free tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo, set root directory to `backend/`
4. Configure:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   JWT_SECRET=your-strong-secret-key
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```
6. Deploy — note the URL e.g. `https://nearbyfinder-api.onrender.com`

---

### Frontend — Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo, set **Root Directory** to `frontend`
3. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://nearbyfinder-api.onrender.com
   ```
4. Deploy — Vercel auto-detects Next.js

---

### After Deployment

Update `backend/app/main.py` CORS to allow your Vercel domain:

```python
allow_origins=[
    "http://localhost:3000",
    "https://your-app.vercel.app",
],
```

Redeploy backend after this change.

---

## Features

- Interactive OpenLayers map with OpenStreetMap tiles
- Custom SVG pin markers per category (Hospital, ATM, Shop, Others)
- Nearby search using PostGIS `ST_DWithin` + `ST_Distance`
- Category filtering on all pages
- Google Maps-style sidebar with service details
- Smooth map pan/zoom animations
- Admin panel — add, edit, delete services
- JWT authentication (admin only)
- Mobile responsive — hamburger drawer, 2×2 search grid on mobile
- 27 unit tests (backend)
- Swagger UI at `/docs`
