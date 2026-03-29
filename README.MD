# PawPath

**AI-powered dog walk planner.** Upload a photo of your dog, get their breed detected automatically, and receive a personalized walk plan based on real-time weather and air quality — all in under 5 minutes.

---

## What It Does

1. **Snap a photo** — Upload your dog's photo and Google Gemini AI instantly identifies the breed, estimated size, age, and weight.
2. **We check conditions** — Live weather (temperature, humidity, wind) and Air Quality Index (AQI) are fetched for your exact location via Google APIs.
3. **Get your walk plan** — A breed-specific walk recommendation is generated with duration, distance, intensity, best time of day, and safety tips tailored to today's conditions.
4. **Find a vet** — Search for nearby veterinary clinics by address, with ratings, open/closed status, and directions.

---

## Features

| Feature | Details |
|---|---|
| **AI Breed Detection** | Google Gemini Vision identifies breed from up to 3 photos (JPG, PNG, WEBP, HEIC) |
| **Walk Recommendations** | Duration, distance, intensity, and tips per breed — adjusted for live weather/AQI |
| **Live Weather Bar** | Real-time temp, humidity, wind, and AQI with a walk score (0–100) |
| **Walk Route Map** | Google Maps embed showing dog-friendly parks near your location |
| **Vet Finder** | Address search → Google Places → nearby vets with ratings, hours, and website |
| **Dog Profiles** | Persistent dog management with photo uploads via Supabase Storage |
| **Google OAuth** | One-click sign-in; supports onboarding before sign-in with localStorage handoff |

---

## Tech Stack

### Frontend
- **React 18** + **Vite 5** + **React Router 6**
- **Tailwind CSS 3** with custom design system (`paw-red`, `paw-blue`, `paw-cream`, `paw-pink`)
- **Supabase JS SDK** — auth, database, and storage
- **Leaflet / React-Leaflet** — available for interactive maps

### Backend (Python — Primary)
- **FastAPI** on port `8000`
- **Google Gemini AI** (`google-genai`) — breed identification
- **Google Maps Platform** — Places, Directions, Weather, Air Quality APIs
- **httpx** for async HTTP, **Pillow** + **pillow-heif** for image processing

### Backend (Node.js — Data Layer)
- **Express 5** on port `3000`
- **Supabase JS SDK** — dog CRUD operations
- **Multer** — file upload handling

### Database
- **Supabase** (PostgreSQL + Auth + Storage)
  - `dogs` table: `id`, `owner_id`, `name`, `breed`, `size`, `weight`, `age`, `image`, `vet_records`
  - `dog-photos` storage bucket

---

## Project Structure

```
pawpath/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Onboard.jsx       # 2-step dog onboarding (upload → confirm)
│   │   │   ├── Planner.jsx       # Walk planner with dog selector
│   │   │   ├── Dog.jsx           # Dog profile page
│   │   │   ├── Account.jsx       # User account & dog management
│   │   │   └── Vets.jsx          # Vet finder
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── planner/
│   │   │       ├── WalkRecommendations.jsx  # Breed-specific walk stats & tips
│   │   │       ├── WeatherBar.jsx           # Live weather + walk score
│   │   │       ├── MapView.jsx              # Google Maps embed
│   │   │       └── BreedUploader.jsx        # Photo upload for breed ID
│   │   └── lib/
│   │       └── supabaseClient.js
│   └── vite.config.js            # Proxies /api/* → localhost:8000
│
├── backend/
│   ├── main.py                   # FastAPI app entry point
│   ├── routes/
│   │   ├── gemini.py             # POST /api/identify — breed detection
│   │   ├── weather.py            # GET /api/weather/current
│   │   ├── walks.py              # GET /api/walks/routes — route + advisory
│   │   └── vets.py               # GET /api/vets — nearby vet search
│   └── node-backend/
│       ├── app.js                # Express app (port 3000)
│       └── routes/
│           ├── dogs.js           # Full CRUD for dogs table
│           ├── weather.js        # OpenWeatherMap fallback
│           └── upload.js         # Multer file proxy
│
└── requirements.txt
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase project
- Google Cloud project with these APIs enabled:
  - Gemini API
  - Maps JavaScript API
  - Places API
  - Directions API
  - Weather API
  - Air Quality API
  - Geocoding API

### Environment Variables

**`backend/.env`**
```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**`frontend/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**`backend/node-backend/.env`**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
```

### Running Locally

**Python backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Node backend (optional, for dog CRUD):**
```bash
cd backend/node-backend
npm install
node app.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies all `/api/*` requests to the Python backend on port `8000`.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/identify` | Upload 1–3 dog photos → returns breed, size, estimated weight & age |
| `GET` | `/api/weather/current?lat=&lon=` | Returns temperature, humidity, wind, AQI for a coordinate |
| `GET` | `/api/walks/routes?origin_lat=&origin_lng=&distance_preference=&heat_sensitivity=` | Returns weather advisory, nearest park, walking directions, and route polyline |
| `GET` | `/api/vets?address=` | Returns up to 10 nearby veterinary clinics with ratings and websites |

---

## Supabase Setup

Create a `dogs` table:
```sql
create table dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text,
  breed text,
  size text,
  weight text,
  age text,
  image text,
  vet_records text,
  created_at timestamptz default now()
);

alter table dogs enable row level security;

create policy "Users can manage their own dogs"
  on dogs for all
  using (auth.uid() = owner_id);
```

Create a `dog-photos` storage bucket and set it to public.

Enable Google as an OAuth provider in your Supabase project under Authentication → Providers.
