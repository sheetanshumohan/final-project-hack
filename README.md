# 🌊 Coastal Early Warning Platform

A comprehensive AI-powered coastal early warning system that analyzes satellite imagery, assesses vulnerability, calculates carbon emissions, and generates real-time risk alerts for Indian coastal regions.

## 🎯 Features

### 🔬 **Module 1: AI Image Analysis**
- GPT-4o vision-based satellite image analysis
- Mangrove loss detection and quantification
- Before/after comparison with confidence scoring
- Automated greenness drop calculation

### 🏔️ **Module 2: Vulnerability Assessment**
- Multi-factor vulnerability scoring
- Elevation, distance, and land cover analysis
- Weighted risk calculation algorithm
- Geographic vulnerability mapping

### 🌿 **Module 3: Carbon Emission Calculator**
- CO₂e calculations from mangrove loss
- Carbon per hectare estimation
- Environmental impact quantification

### ⚠️ **Module 4: Real-time Risk Assessment**
- Weather-integrated risk scoring
- SMS and dashboard alert generation
- Time-windowed risk projections
- Multi-audience alert customization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
│                 │    │                 │    │                 │
│ React Dashboard │◄──►│ Express API     │◄──►│ MongoDB         │
│ Search & Display│    │ Pipeline Engine │    │ Collections:    │
│ Risk Alerts     │    │ 4 Modules       │    │ - Input         │
│                 │    │                 │    │ - Output        │
└─────────────────┘    └─────────────────┘    │ - RiskEvent     │
                                              └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- OpenAI API Key

### Backend Setup
```bash
cd BACKEND
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
node src/index.js
```

### Frontend Setup
```bash
cd FRONTEND
npm install
npm start
```

### Load Sample Data
```bash
cd BACKEND
node load-indian-coastal-data.js
```

## 📊 API Endpoints

### Pipeline (Recommended)
- `POST /api/pipeline/quick/:parcelName` - Run complete analysis
- `GET /api/pipeline/status/:parcelName` - Check completion status

### Individual Modules
- `POST /api/m1/run/:parcelName` - Image analysis only
- `POST /api/m2/run/:parcelId` - Vulnerability assessment
- `POST /api/m4/run/:inputId` - Risk assessment

## 🇮🇳 Sample Indian Coastal Data

| Location | Village | Risk Level | Coordinates |
|----------|---------|------------|-------------|
| 🔴 Mandvi_Coast | Kutch, Gujarat | HIGH | High tide + heavy rain |
| 🔴 Konark_Shore | Ramachandi, Odisha | HIGH | Cyclone prone area |
| 🔴 Nagapattinam_Bay | Velankanni, Tamil Nadu | HIGH | Bay vulnerability |
| 🟡 Sundarban_Delta | Gosaba, West Bengal | MEDIUM | Mangrove protection |
| 🟡 Rameswaram_Belt | Pamban, Tamil Nadu | MEDIUM | Island geography |
| 🟡 Devbhumi_Creek | Dwarka, Gujarat | MEDIUM | Tidal variations |
| 🟢 Chilika_Block | Satapada, Odisha | LOW | Protected lagoon |
| 🟢 Malpe_Port | Udupi, Karnataka | LOW | Stable conditions |
| 🟢 Machilipatnam_Block | Krishna, Andhra Pradesh | LOW | Safe zone |

## 🧪 Testing

### Frontend Testing
1. Open `http://localhost:3000`
2. Search for any parcel (e.g., "Sundarban_Delta")
3. View real-time risk analysis results

### API Testing (Postman)
```bash
POST http://localhost:4000/api/pipeline/quick/Mandvi_Coast
Content-Type: application/json
Body: {"timeWindowHrs": 12}
```

## 📁 Project Structure

```
📦 final-project-hack
├── 🎨 FRONTEND/               # React Dashboard
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Dashboard page
│   │   └── App.jsx           # Main app component
│   └── package.json
│
├── ⚙️ BACKEND/                # Node.js API
│   ├── src/
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── lib/              # Module implementations
│   │   └── index.js          # Express server
│   └── package.json
│
└── 📖 README.md
```

## 🔧 Configuration

### Environment Variables
Create `.env` in BACKEND directory:
```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/coastal
OPENAI_API_KEY=your_openai_api_key_here
CARBON_PER_HA=10
```

## 🤖 AI Integration

- **Image Analysis**: GPT-4o with vision capabilities
- **Risk Assessment**: Multi-factor weighted algorithms
- **Alert Generation**: Context-aware message creation
- **Fallback Systems**: Deterministic backups for all AI features

## 📈 Data Flow

1. **Input**: Parcel name via frontend search
2. **Module 1**: AI analyzes before/after satellite images
3. **Module 2**: Calculates vulnerability based on geographic factors  
4. **Module 3**: Computes carbon emissions from mangrove loss
5. **Module 4**: Generates real-time risk alerts with SMS/dashboard messages
6. **Output**: Comprehensive risk assessment displayed in dashboard

## 🎯 Use Cases

- **Disaster Management**: Early warning for coastal communities
- **Environmental Monitoring**: Mangrove conservation tracking
- **Policy Planning**: Data-driven coastal protection strategies
- **Research**: Climate change impact assessment

## 🔬 Technology Stack

**Frontend**: React, Framer Motion, Axios, Tailwind CSS  
**Backend**: Node.js, Express, Mongoose, OpenAI API  
**Database**: MongoDB  
**AI/ML**: GPT-4o Vision, Computer Vision, Risk Modeling  

## 🚀 Deployment

Ready for deployment on:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas

## 📄 License

MIT License - Feel free to use this project for research and development.

## 🤝 Contributing

Contributions welcome! Please read the contribution guidelines and submit pull requests.

---

**Built with ❤️ for coastal community safety and environmental protection**
