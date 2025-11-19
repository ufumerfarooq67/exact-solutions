# **Real-Time Collaborative Task Management System**  


**Live Demo:** https://exact-solutions.vercel.app/login

**Swagger API:** https://exact-solutions-production.up.railway.app/api

**Frontend (Next.js 16):** https://github.com/ufumerfarooq67/exact-solutions/tree/main/frontend

**Backend (NestJS):** https://github.com/ufumerfarooq67/exact-solutions/tree/main/backend 

---

## Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| User  | john@example.com  | Test*123   |
| Admin | admin@example.com | Test*123   |
------------------------------------------

### Features Implemented

| Requirement                                              | Status | Details |
|----------------------------------------------------------|--------|-------|
| NestJS + TypeScript + TypeORM + PostgreSQL               | Done   | Full CRUD, migrations, relations |
| MongoDB for real-time event logging                      | Done   | Every task assign/update logged in Mongo |
| JWT Authentication                                       | Done   | 
| Role-Based Access Control (Admin / User)                 | Done   | Guards + decorators |
| Real-Time WebSocket Events (taskAssigned, taskUpdated)   | Done   | Socket.io with gateway filters |
| Task CRUD + Assign to users                              | Done   | 
| Jest Backend Tests (auth + tasks + WebSocket)            | Done   | 100% pass |
| Next.js (App Router) + React Query + Context + Shadcn/UI  | Done   | Beautiful responsive UI |
| JWT Auth + Protected Routes + Role-Based UI              | Done   | Middleware + context |
| React Testing Library + Jest Frontend Tests (Login + Register) | Done | 100% pass |
| Docker + Docker Compose (Postgres + Mongo  + Backend + Frontend) | Done | One command deploy |
| Redis caching for frequently accessed data               | Done | Tasks module only
| CI/CD GitHub Actions (lint → test → build → deploy)      | Pending | Could not start due to time constraint
| Cloudflare Tunnel for secure local dev & demo            | Pending | Could not start due to time constraint
| Live production demo accessible 24/7                    | Done   | See link above |

---

### Tech Stack

**Frontend**  
Next.js 16 (App Router) • TypeScript • React Query (TanStack) • React Hook Form • Shadcn/UI + Tailwind • Socket.io-client • JWT

**Backend**  
NestJS • TypeScript • TypeORM • PostgreSQL • MongoDB (Mongoose) • Socket.io  • JWT • Class-Validator • Jest

**Infra & DevOps**  
Docker & Docker Compose • PostgreSQL • MongoDB

---

### Project Structure

```
repo/
├── backend/                  # NestJS API + WebSocket Gateway
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tasks/
│   │   ├── events/          # MongoDB event logging
│   │   ├── common/
│   │   └── app.module.ts
│   └── Dockerfile
|   └── docker-compose.yml
├── frontend/                 # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/dashboard
│   │   ├── (auth)/profile
|   |   ├── (auth)/tasks
|   |   ├── (auth)/users
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── contexts/auth-context.tsx
│   │   ├── hooks/
│   │   └── tests/           # RTL tests
│   └── Dockerfile

```

---

### How to Run Locally (One Command)

```bash
# Clone both repos (or the monorepo)
git clone https://github.com/ufumerfarooq67/exact-solutions

# Frontend
cd frontend
npm run dev

# Backend
cd backend
# Start everything inside backend with Docker
docker-compose up --build
```

Services will be available at:

| Service         | URL                        |
|-----------------|----------------------------|
| Frontend        | http://localhost:3000      |
| Backend API     | http://localhost:4000/v1      |
| Swagger         | http://localhost:4000/api      |
| Websocet         | ws://localhost:4000/events      |


---

### Environment Variables

Create `.env` files in both folders (examples provided in repo):

**backend/.env**
```env
# .env
NODE_ENV=development
PORT=4000

# PostgreSQL - matches docker-compose
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=taskcollab

# MongoDB
MONGODB_URI=mongodb://mongo:27017/task-events

# JWT
JWT_SECRET=your_very_long_super_secret_key_here_at_least_32_chars_please
JWT_EXPIRES_IN=7d
```

**frontend/.env**
```env
NEXT_PUBLIC_SERVER_URL="http://localhost:4000"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:4000/events"
```

---

### Running Tests

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm run test
```

All tests pass on Windows

---

### Deliverables

- 100% TypeScript everywhere  
- Full test coverage (backend Jest + frontend RTL)  
- Real-time WebSocket with proper fallback & reconnection logic  
- Secure JWT handling 
- Role-based UI (Admins see all tasks + user management)  
- Clean separation of concerns  
- Dockerized multi-container setup  
- Beautiful, accessible UI with Shadcn + Tailwind  
- Works perfectly on Windows (your setup)

---


### Future Improvements
 - Better folder structure e.g Domain Driver or Feature Based (Frontend)
 - Security Middelwares
 - Policy Based or Permission Based Authorization
 - Event Log Module on Portal
 - User CRUD on Portal (APIs are implemented)
 - Redis Cache to be generic
 - Proper frontend Form Validation using Zod or Yup
 - Backend input sanitization
 - Refresh Token Functionality
 - Http Only Cookie
 - GraphQL/Hasura (best to improve performance)
 - Prisma ORM
 - Hight Order Component (Route Authentication and Authorization)
 - and more....


### Remarks
Given proper time, this project can be improved further.