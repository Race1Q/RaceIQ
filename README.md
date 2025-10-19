# RaceIQ 
## [![codecov](https://codecov.io/gh/Race1Q/RaceIQ/graph/badge.svg?token=0B9G4DM0W3)](https://codecov.io/gh/Race1Q/RaceIQ)
A modern, AI-powered Formula 1 analytics and fan engagement platform built with React, NestJS, and Google Gemini AI.😉

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![React](https://img.shields.io/badge/React-18+-61dafb.svg)
![NestJS](https://img.shields.io/badge/NestJS-10+-e0234e.svg)

##  Features

###  AI-Powered Insights
- **AI-Generated News**: Real-time F1 news analysis powered by Google Gemini 2.0 Flash
- **Driver Biographies**: Intelligent, comprehensive driver profiles with career highlights
- **Track Insights**: Circuit analysis, historical data, and track characteristics
- **Smart Caching**: TTL-based caching (60min news, 48h bios, 24h tracks) for optimal performance

###  Data & Analytics
- **Live Race Data**: Real-time race results, standings, and statistics
- **Championship Standings**: Driver and constructor rankings with visual charts
- **Historical Data**: Complete race history and season comparisons
- **Machine Learning Predictions**: Python-powered race outcome predictions
- **Customizable Dashboards**: Drag-and-drop widgets with persistent layouts

###  User Experience
- **Interactive 3D Visuals**: Three.js powered hero sections and animations
- **Dark/Light Themes**: System-aware theme switching with next-themes
- **Responsive Design**: Mobile-first UI with Chakra UI components
- **Advanced Animations**: GSAP and Framer Motion for fluid interactions
- **PDF Exports**: Generate race reports with jsPDF and html2canvas
- **Touch-Friendly**: Swiper carousels for race/driver highlights

### Authentication & Security
- **Auth0 Integration**: Secure OAuth2/JWT authentication
- **Role-Based Access**: Protected routes and API endpoints
- **Passport Guards**: JWT validation middleware
- **Rate Limiting**: Built-in throttling to prevent abuse

### Notifications
- **Email Alerts**: Race reminders and personalized notifications
- **Multi-Provider Support**: SendGrid primary, Nodemailer fallback
- **Scheduled Jobs**: Automated race weekend notifications

##Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (fast dev server, optimized builds)
- **UI Library**: Chakra UI + Emotion (CSS-in-JS)
- **Routing**: React Router v6
- **State Management**: React Context + Custom Hooks
- **Animations**: Framer Motion + GSAP
- **3D Graphics**: Three.js + @react-three/fiber + drei
- **Charts**: Recharts
- **Icons**: Lucide React + React Icons
- **Testing**: Vitest + Testing Library + jsdom

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM + Supabase JS Client
- **Authentication**: Auth0 + Passport JWT
- **AI/ML**: Google Generative AI (Gemini 2.0 Flash) + Python Shell
- **Email**: SendGrid + Nodemailer
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer
- **Scheduling**: @nestjs/schedule (cron jobs)
- **Testing**: Jest + Supertest + ts-jest

### DevOps & Tools
- **Database Hosting**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **Email Service**: SendGrid + Gmail SMTP
- **External API**: Custom F1 data API (Render hosted)
- **Code Quality**: ESLint + Prettier
- **Testing**: 100% TypeScript coverage with Vitest/Jest

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ (for ML predictions)
- PostgreSQL (or Supabase account)
- Auth0 account
- Google AI API key (Gemini)

### Clone Repository
```bash
git clone https://github.com/yourusername/RaceIQ.git
cd RaceIQ
