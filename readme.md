# Satsankalpa Advocacy Form

A full-stack advocacy membership application with Next.js frontend and Express.js backend.

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- MySQL database
- Gmail account with App Password (for email service)

### Setup Instructions

#### 1. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

#### 2. Database Setup

1. Create a MySQL database
2. Copy the `.env.example` file in the `backend` directory to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Update the database credentials in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   ```
4. Run database migrations:
   ```bash
   cd backend
   npm run db:push
   ```

#### 3. Email Service Setup

1. The email service uses Gmail. To set it up:
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Generate an App Password at: https://myaccount.google.com/apppasswords
   
2. Update the email configuration in `backend/.env`:
   ```env
   EMAIL_USER=admin@satsankalpa.org
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM="Satsankalpa Advocacy Membership" <admin@satsankalpa.org>
   ```

#### 4. Environment Variables

**Backend** (`backend/.env`):
- `DB_HOST` - MySQL database host (required)
- `DB_PORT` - MySQL database port (required, default: 3306)
- `DB_USER` - MySQL database user (required)
- `DB_PASSWORD` - MySQL database password (required)
- `DB_NAME` - MySQL database name (required)
- `PORT` - Server port (optional, default: 3001)
- `EMAIL_USER` - Gmail account email (required)
- `EMAIL_PASS` - Gmail App Password (required)
- `EMAIL_FROM` - Email sender name/address (optional)
- `ADMIN_EMAIL` - Admin email for startup verification (optional)
- `SEND_STARTUP_EMAIL` - Disable startup verification email by setting to 'false' (optional)

**Frontend**:
Currently uses hardcoded API URL. To make it configurable for local development, you can modify `frontend/src/lib/axios.js` to use `process.env.NEXT_PUBLIC_API_URL` or similar.

#### 5. Running the Application

**Development mode:**
```bash
# From root directory
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Start in production:**
```bash
npm start
```

### Project Structure

```
├── backend/          # Express.js backend
│   ├── src/         # Source code
│   ├── drizzle/     # Database migrations
│   └── .env         # Environment variables (create from .env.example)
├── frontend/        # Next.js frontend
│   └── src/         # Source code
└── package.json     # Root package.json with scripts
```

### Missing Configuration

Make sure you have:

1. ✅ **Database credentials** - Set up in `backend/.env`
2. ✅ **Gmail App Password** - Required for email service
3. ⚠️ **Frontend API URL** - Currently hardcoded to `https://services.satsankalpa.org`. For local development, you may want to change it to `http://localhost:3001` in `frontend/src/lib/axios.js`

### Notes

- The email service previously had hardcoded credentials which have been moved to environment variables for security
- Make sure your MySQL database is running before starting the backend
- The backend runs on port 3001 by default
- The frontend runs on port 3000 by default (Next.js)

### Troubleshooting

**Database connection errors:**
- Verify your MySQL database is running
- Check that all database credentials in `.env` are correct
- Ensure the database exists

**Email service errors:**
- Make sure you're using a Gmail App Password, not your regular password
- Verify 2-Step Verification is enabled on your Google account
- Check that `EMAIL_USER` and `EMAIL_PASS` are set correctly

**Port conflicts:**
- Change the `PORT` in `backend/.env` if port 3001 is already in use
- Change the frontend port by modifying `frontend/package.json` dev script
