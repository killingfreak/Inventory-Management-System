# Quick Start Guide

Get the Inventory Management System running in 5 minutes!

## 🚀 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## ⚡ Quick Setup

### 1. Backend Setup (5 steps)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database URL and secret key

# Run the server
uvicorn main:app --reload
```

**Create SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Database Setup

```bash
# Create database
createdb inventory_db

# Seed with demo data (optional but recommended)
python seed_db.py
```

### 3. Frontend Setup (3 steps)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env if needed (default points to localhost:8000)

# Run development server
npm run dev
```

## 🎯 Access the Application

1. **Backend API:** http://localhost:8000
2. **API Docs:** http://localhost:8000/api/docs
3. **Frontend:** http://localhost:5173

## 👤 Demo Login Credentials

If you ran the seed script:

- **Admin:** admin@inventory.com / admin123
- **Manager:** manager@inventory.com / manager123
- **Viewer:** viewer@inventory.com / viewer123

## 🔧 Common Issues

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check SECRET_KEY is set

### Frontend can't connect
- Ensure backend is running on port 8000
- Check VITE_API_BASE_URL in .env
- Verify CORS settings in backend

### Database errors
- Create database: `createdb inventory_db`
- Check DATABASE_URL format: `postgresql://user:password@localhost:5432/inventory_db`

## 📦 Production Deployment

See the main README.md for detailed deployment instructions to:
- **Backend:** Render.com
- **Frontend:** Vercel
- **Database:** Render PostgreSQL

## 🎨 Features to Test

1. ✅ Login with different roles
2. ✅ View dashboard statistics
3. ✅ Add/Edit/Delete inventory items (based on role)
4. ✅ Search and filter inventory
5. ✅ View audit logs (Admin/Manager only)
6. ✅ Logout functionality

## 📚 Next Steps

- Read the full README.md for architecture details
- Explore API documentation at /api/docs
- Customize the frontend theme
- Add more features!

---

**Need Help?** Check the main README.md for troubleshooting and detailed documentation.
