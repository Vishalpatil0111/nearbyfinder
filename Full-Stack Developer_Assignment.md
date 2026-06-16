## **Junior Full-Stack Developer Assignment** 

## **Problem Statement** 🎯 

**Title:** Nearby Services Finder (Full-Stack Geo App) 

Build a full-stack application that allows users to view and discover nearby services (hospitals, ATMs, shops, etc.) on a map based on their location. The system must include geospatial backend APIs and a frontend built using **Next.js** . 

## 🧭 **Objective** 

Develop a full-stack solution that allows: 

- Public users to view all services directly on a map 

- Public users to search nearby services using coordinates 

- Admin to manage services 

- Geospatial search using PostGIS 

- A simple frontend UI for interaction 

## **Authentication & Roles** 🔐 

Only **Admin authentication** is required. 

## **Roles** 

## **Public User (Default – No Login Required)** 

- View all services on map 

- Search nearby services 

- Filter by category 

- View service details 

## **Admin** 

- Secure login 

- Add, update, delete services 

- Manage service data 

## 🛠 **Technology Stack** 

## **Backend (Choose One)** 

## **Option 1 — Django Stack** 

- Django 

- Django REST Framework 

- GeoDjango 

- PostgreSQL + PostGIS 

- JWT Authentication (Admin only) 

## **Option 2 — FastAPI Stack** 

- FastAPI 

- SQLAlchemy / GeoAlchemy2 

- PostgreSQL + PostGIS 

- JWT Authentication (Admin only) 

## **Frontend (Mandatory)** 

- Next.js 

- Tailwind / CSS 

- Map integration (Google Maps / OpenLayers / Leaflet) 

- API integration 

## 📦 **Core Functional Requirements** 

## **1 Admin Authentication** 

APIs for: 

- Admin login 

- Token authentication 

## **2 Service Location Management (Admin Only)** 

Fields: 

- Name 

- Category (hospital, ATM, shop, etc.) 

- Latitude 

- Longitude 

- Rating (optional) 

- Created timestamp 

Operations: 

- Add service 

- Update service 

- Delete service 

- List services 

## **3 View All Services on Map (Public – Default)** 

- All services should be visible on the map without login 

- Map markers should represent service locations 

- Clicking a marker shows: 

   - Name 

   - Category 

   - Distance (optional) 

   - Rating 

## **4 Nearby Service Search** 

User inputs: 

- Latitude 

- Longitude 

- Radius (km) 

System should: 

- Return services within radius 

- Sort by nearest distance 

- Show calculated distance 

## **5 Category Filtering** 

Allow filtering by: 

- Hospital 

- ATM 

- Shops 

- Others 

## 🗄 **Database Expectations** 

Use spatial data types: 

- Point for service location 

Spatial operations required: 

- Radius search 

- Distance calculation 

## 🖥 **Frontend Requirements (Next.js)** 

## **Pages** 

- Home page with map showing all services 

- Nearby search page 

- Service list 

## **Admin Panel** 

- Admin login 

- Add service 

- Manage services 

## **Features** 

- Map view with markers 

- Show all services by default 

- Nearby search option 

- Category filters 

- Marker click → service details 

## **Deliverables** 📤 

Candidate must submit: 

- GitHub/GitLab repository 

- Backend APIs 

- Next.js frontend 

- API documentation (Swagger/Postman) 

- Setup instructions 

- Sample data 

## **Evaluation Criteria** 🧪 

## **Backend** 

- API design 

- Admin authentication 

- Database design 

- Geospatial queries 

## **Frontend** 

- Next.js architecture 

- Map integration 

- API integration 

## **Overall** 

- Code structure 

- Clean coding practices 

- Documentation 

- Git usage 

## 💡 **Expected Outcome** 

This assignment should demonstrate: 

- Full-stack development capability 

- Backend API implementation 

- Next.js frontend skills 

- Admin-only authentication 

- GIS and spatial query understanding 

- Production-style coding practices 

