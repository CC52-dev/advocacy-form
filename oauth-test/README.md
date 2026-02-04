# OAuth Test Application

This is a simple test application to demonstrate OAuth/SSO integration with the main advocacy platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3002`

## Configuration

The application uses the following API key (hardcoded in `app/page.jsx`):
```
app_8554f6eae8fd2545d85c64c7b346548cf9a023954178a908f0881cc87f5b4591
```

**Important:** In the main advocacy platform, create an application with:
- **Name:** OAuth Test App (or any name you prefer)
- **URL:** `http://localhost:3002`
- **Status:** Active

## How it works

1. User launches the application from the main advocacy platform
2. The platform generates a launch token and redirects to: `http://localhost:3002/?launch_token=<TOKEN>`
3. The home page detects the `launch_token` parameter, saves it to localStorage, and cleans the URL
4. The home page verifies the token with the backend API (using the API key) and displays user information
5. User can logout, which clears the token from localStorage

## API Integration

The app makes a POST request to `http://localhost:3001/api/applications/verify-launch` with:
- `token`: The launch token from the URL
- `apiKey`: The application's API key

The API returns:
- `session`: Session validity and expiration information
- `user`: User details (id, firstname, lastname, email, interests)
- `permissions`: Array of user's permissions for this specific application
- `application`: Application details (id, name)

## Features Demonstrated

✅ OAuth/SSO token-based authentication  
✅ Secure API key verification  
✅ Session management with localStorage  
✅ Beautiful, modern UI with Tailwind CSS  
✅ Real-time session expiration display  
✅ User profile and permissions display  
✅ Graceful error handling
