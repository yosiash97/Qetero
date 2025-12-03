# Hotel Management System

## Overview
A full-stack hotel management application with room reservations, order management, and maintenance tracking. Built with NestJS backend and Next.js frontend, designed for Ethiopian hotels with multilingual support (English/Amharic).

## Project Structure
```
.
├── backend/          # NestJS backend API
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── bookings/       # Room booking management
│   │   ├── database/       # Database seeding
│   │   ├── hotels/         # Hotel CRUD operations
│   │   ├── maintenance/    # Maintenance requests (with AI categorization)
│   │   ├── orders/         # Room service orders
│   │   ├── rooms/          # Room management
│   │   └── users/          # User management
│   └── package.json
│
├── client/           # Next.js frontend
│   ├── app/              # Next.js 13+ app directory
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   └── lib/             # Utilities and API client
│
└── start.sh         # Startup script for both services
```

## Technology Stack
- **Backend**: NestJS, TypeORM, PostgreSQL, Passport JWT
- **Frontend**: Next.js 16, React 19, TailwindCSS, Radix UI
- **Database**: PostgreSQL (Neon)
- **Optional**: OpenAI API for maintenance request categorization

## Environment Setup

### Backend (.env)
The backend uses the following environment variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` - PostgreSQL connection
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRATION` - Token expiration time
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment mode
- `OPENAI_API_KEY` - (Optional) For AI-powered maintenance categorization

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (http://localhost:3001/api)

## Running the Application

### Development
The application runs both backend and frontend simultaneously via the workflow:
- Backend API: Running on port 3001 (internal)
- Frontend: Access via the Replit webview preview (port 5000)
- All API requests from the frontend are automatically proxied to the backend

### Database Seeding
To populate the database with sample data:
```bash
cd backend && npm run seed
```

This creates:
- 3 Hotels (New York, Miami, Denver)
- 60 Rooms (various types: standard, deluxe, suite, presidential)
- 4 Users (1 admin, 3 guests)
- 3 Active bookings
- 10 Maintenance requests with Amharic translations

### Default Credentials
- Admin: `admin@hotel.com` / `admin123`
- Guest: `guest1@example.com` / `guest123`

## Key Features
1. **Room Management**: Track room availability, status, and bookings
2. **Booking System**: Check-in/check-out, cancellations, special requests
3. **Maintenance Tracking**: Multi-language support, AI categorization, priority levels
4. **Order Management**: Room service and amenity requests
5. **User Authentication**: JWT-based auth with role-based access control

## API Endpoints
- `/api/auth/*` - Authentication (login, register)
- `/api/users/*` - User management
- `/api/hotels/*` - Hotel CRUD
- `/api/rooms/*` - Room management and availability
- `/api/bookings/*` - Booking operations
- `/api/orders/*` - Order management
- `/api/maintenance/*` - Maintenance requests

## Recent Changes
**December 3, 2025**
- Configured for Replit environment
- Set up PostgreSQL database with SSL
- Backend running on port 3001 (localhost)
- Frontend running on port 5000 (0.0.0.0)
- Made OpenAI integration optional for maintenance service
- Created startup script for concurrent backend/frontend execution
- Configured deployment settings for production

## Deployment
The application is configured for Replit VM deployment (always-on):
- Build command compiles both backend and frontend
- Run command starts both backend API (port 3001) and Next.js server (port 5000)
- Frontend served on port 5000 with API proxying to backend
- VM deployment mode ensures both services run continuously

**Note**: For production, consider using proper SSL certificate validation for the PostgreSQL connection by providing Neon's CA certificate.
