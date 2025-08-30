# Coastal Early Warning Platform

AI-powered coastal risk assessment system for Indian coastal regions.

## Features

- **AI Image Analysis**: Satellite image analysis with GPT-4o
- **Vulnerability Assessment**: Geographic risk scoring
- **Carbon Calculator**: CO2e emissions from mangrove loss
- **Risk Alerts**: Real-time SMS and dashboard alerts

## Quick Start

### Backend
```bash
cd BACKEND
npm install
# Add OPENAI_API_KEY to .env file
node src/index.js
```

### Frontend
```bash
cd FRONTEND
npm install
npm start
```

## API Usage

**Run complete analysis:**
```
POST /api/pipeline/quick/Sundarban_Delta
```

**Check status:**
```
GET /api/pipeline/status/Sundarban_Delta
```

## Sample Locations

- Sundarban_Delta (West Bengal)
- Mandvi_Coast (Gujarat)
- Konark_Shore (Odisha)
- Rameswaram_Belt (Tamil Nadu)
- And 5 more Indian coastal regions

## Tech Stack

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- AI: OpenAI GPT-4o Vision API
