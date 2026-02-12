# Role-Based Inventory & Audit Management System

A production-ready full-stack inventory management system with role-based access control, real-time audit logging, and a professional dashboard interface.

## 🏗️ Project Architecture

### Technology Stack

**Backend:**
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL with SQLAlchemy ORM (async)
- **Authentication:** JWT (JSON Web Tokens) with OAuth2 password flow
- **Validation:** Pydantic schemas
- **Security:** Bcrypt password hashing, role-based permissions

**Frontend:**
- **Framework:** React 18 with Vite
- **UI Library:** Material-UI (MUI) v5
- **State Management:** React Context API
- **HTTP Client:** Axios with interceptors
- **Routing:** React Router v6
- **Data Grid:** MUI X DataGrid

**Deployment:**
- **Backend:** Render.com (PostgreSQL + Web Service)
- **Frontend:** Vercel
- **Environment:** Production-ready with environment variables

### System Architecture

```
┌─────────────────┐
│   React App     │  ← Vercel
│   (Frontend)    │
└────────┬────────┘
         │ HTTPS/REST API
         │
┌────────▼────────┐
│   FastAPI       │  ← Render
│   (Backend)     │
└────────┬────────┘
         │ SQLAlchemy (Async)
         │
┌────────▼────────┐
│   PostgreSQL    │  ← Render Database
│   (Database)    │
└─────────────────┘
```

### Database Schema

**Users Table:**
- `id` (PK), `email`, `username`, `hashed_password`
- `full_name`, `role` (admin/manager/viewer)
- `is_active`, `created_at`, `updated_at`

**Inventory Items Table:**
- `id` (PK), `name`, `sku` (unique), `description`
- `quantity`, `unit_price`, `category`, `location`
- `created_by` (FK to Users), `created_at`, `updated_at`

**Audit Logs Table:**
- `id` (PK), `action` (CREATE/UPDATE/DELETE)
- `item_id` (FK to Inventory), `user_id` (FK to Users)
- `changes` (JSON), `timestamp`

### Role-Based Access Control

| Role    | Permissions                                |
|---------|-------------------------------------------|
| Admin   | Full access: CRUD items, view audit logs, delete items |
| Manager | Create, Read, Update items, view audit logs |
| Viewer  | Read-only access to inventory             |

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **PostgreSQL 14+** (or use Render's managed database)
- **Git**

### Backend Setup

1. **Clone the repository:**
   ```bash
   cd inventory-system/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
   SECRET_KEY=your-super-secret-key-at-least-32-characters-long
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   FRONTEND_URL=http://localhost:5173
   APP_NAME=Inventory Management System
   DEBUG=False
   ```

5. **Create PostgreSQL database:**
   ```bash
   # Using psql
   createdb inventory_db
   
   # Or connect to PostgreSQL and run:
   CREATE DATABASE inventory_db;
   ```

6. **Run the application:**
   ```bash
   uvicorn main:app --reload
   ```
   
   Backend will be available at: `http://localhost:8000`
   API Documentation: `http://localhost:8000/api/docs`

7. **Create initial admin user (optional):**
   You can use the API docs at `/api/docs` to register a user with admin role, or use curl:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@inventory.com",
       "username": "admin",
       "password": "admin123",
       "full_name": "System Admin",
       "role": "admin"
     }'
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd inventory-system/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📦 Deployment Guide

### Backend Deployment (Render)

1. **Create a Render account** at https://render.com

2. **Create PostgreSQL database:**
   - Go to Dashboard → New → PostgreSQL
   - Choose a name (e.g., `inventory-db`)
   - Select free tier or paid plan
   - Copy the **Internal Database URL** (starts with `postgresql://`)

3. **Create Web Service:**
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name:** `inventory-backend`
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables:**
   ```
   DATABASE_URL=<your-render-postgres-internal-url>
   SECRET_KEY=<generate-secure-random-key>
   FRONTEND_URL=https://your-app.vercel.app
   DEBUG=False
   ```
   
   Generate SECRET_KEY:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-5 minutes)
   - Your API will be at: `https://inventory-backend.onrender.com`

### Frontend Deployment (Vercel)

1. **Create a Vercel account** at https://vercel.com

2. **Install Vercel CLI (optional):**
   ```bash
   npm install -g vercel
   ```

3. **Deploy via GitHub:**
   - Go to Vercel Dashboard → New Project
   - Import your GitHub repository
   - Configure:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

4. **Add Environment Variable:**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_BASE_URL=https://inventory-backend.onrender.com
     ```

5. **Deploy:**
   - Click Deploy
   - Your app will be at: `https://your-app.vercel.app`

6. **Update Backend CORS:**
   - Go back to Render → Web Service → Environment
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy backend

### Post-Deployment Checklist

- ✅ Backend API is accessible at Render URL
- ✅ Frontend can connect to backend API
- ✅ CORS is configured correctly
- ✅ Environment variables are set
- ✅ Database migrations completed
- ✅ Can login and create items
- ✅ Audit logs are being recorded

## 🔐 Assumptions & Security

### Security Measures Implemented

1. **Password Security:**
   - Passwords hashed using Bcrypt (industry standard)
   - Minimum 8 characters enforced
   - Never stored in plain text

2. **Authentication:**
   - JWT tokens with configurable expiration (default: 30 minutes)
   - OAuth2 password flow (industry standard)
   - Automatic token refresh on API calls
   - Secure token storage in localStorage (HTTPS only in production)

3. **Authorization:**
   - Role-based access control (RBAC)
   - Endpoint-level permission checks
   - Frontend route guards
   - API-level validation

4. **API Security:**
   - CORS configured for specific origins
   - Request validation using Pydantic
   - SQL injection prevention (SQLAlchemy ORM)
   - Error handling without exposing internals

5. **Database:**
   - Async operations for performance
   - Connection pooling
   - Prepared statements (SQL injection prevention)

### Production Recommendations

For a real production system, consider:

1. **HTTPS Everywhere:** Ensure both frontend and backend use HTTPS
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **Refresh Tokens:** Add refresh token mechanism for better UX
4. **Password Requirements:** Enforce stronger password policies
5. **Two-Factor Auth:** Add 2FA for admin accounts
6. **Audit Log Retention:** Implement log rotation and archival
7. **Backup Strategy:** Regular database backups
8. **Monitoring:** Add APM tools (Sentry, DataDog, etc.)
9. **API Versioning:** Maintain API versioning for backwards compatibility
10. **Security Headers:** Add security headers (CSP, HSTS, etc.)

### Assumptions Made

1. **Single Organization:** System designed for single organization use
2. **Trust Level:** Admin users are trusted to manage other users
3. **Audit Integrity:** Audit logs are immutable (no edit/delete endpoints)
4. **Network:** API and frontend communicate over HTTPS in production
5. **Browser:** Modern browsers with localStorage support
6. **Timezone:** All timestamps stored in UTC
7. **File Upload:** Not implemented (can be added later)
8. **Email Verification:** Not implemented (add for production)

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/api/docs`
- **ReDoc:** `http://localhost:8000/api/redoc`

### Key Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT)
- `GET /api/v1/auth/me` - Get current user info

**Inventory:**
- `GET /api/v1/inventory/` - List items (paginated)
- `GET /api/v1/inventory/stats` - Get statistics
- `GET /api/v1/inventory/{id}` - Get single item
- `POST /api/v1/inventory/` - Create item (Admin/Manager)
- `PUT /api/v1/inventory/{id}` - Update item (Admin/Manager)
- `DELETE /api/v1/inventory/{id}` - Delete item (Admin only)

**Audit:**
- `GET /api/v1/audit/` - List all logs (Admin/Manager)
- `GET /api/v1/audit/item/{id}` - Get logs for specific item

## 🧪 Testing

### Manual Testing

1. **Register a user** with different roles
2. **Login** and verify JWT token
3. **Create inventory items** (admin/manager)
4. **Update items** and verify audit logs
5. **Test role permissions** (viewer cannot edit)
6. **Delete items** (admin only)

### Example Test Accounts

Create these via API:

```json
// Admin
{
  "email": "admin@test.com",
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}

// Manager
{
  "email": "manager@test.com",
  "username": "manager",
  "password": "manager123",
  "role": "manager"
}

// Viewer
{
  "email": "viewer@test.com",
  "username": "viewer",
  "password": "viewer123",
  "role": "viewer"
}
```

## 🛠️ Development Tips

### Running in Development

**Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Code Quality

**Backend:**
```bash
# Format code
black .

# Type checking
mypy .

# Linting
pylint *.py
```

**Frontend:**
```bash
# Linting
npm run lint

# Format (if using Prettier)
npm run format
```

## 📁 Project Structure

```
inventory-system/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   ├── database.py             # Database connection & session
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── auth.py                 # Authentication utilities
│   ├── routers/
│   │   ├── auth_router.py      # Auth endpoints
│   │   ├── inventory_router.py # Inventory endpoints
│   │   └── audit_router.py     # Audit endpoints
│   ├── requirements.txt        # Python dependencies
│   ├── Procfile               # Render deployment config
│   └── .env.example           # Environment template
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DashboardLayout.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Inventory.jsx
    │   │   └── AuditLogs.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── inventoryService.js
    │   │   └── auditService.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## 🤝 Contributing

This is an assessment project, but improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is created for educational/assessment purposes.

## 🙏 Acknowledgments

- FastAPI documentation
- Material-UI team
- React community
- SQLAlchemy maintainers

## 📧 Support

For questions or issues:
- Create an issue in the GitHub repository
- Review API documentation at `/api/docs`
- Check Render/Vercel deployment logs

---

**Built with ❤️ for a Senior Full Stack Engineer Assessment**
