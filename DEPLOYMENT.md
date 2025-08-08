# Production Deployment Guide

## Environment Setup

1. **Copy environment variables**

   ```bash
   cp .env.example .env.production
   ```

2. **Update production environment variables**
   - Set your production Supabase URL and key
   - Add your AI provider API keys
   - Ensure all required variables are set

## Build and Deploy

### Option 1: Docker Deployment

```bash
# Build the production image
docker build -t ai-resume-analyzer:latest .

# Run the container
docker run -d \
  --name ai-resume-analyzer \
  -p 3000:3000 \
  --env-file .env.production \
  ai-resume-analyzer:latest
```

### Option 2: Manual Deployment

```bash
# Install dependencies
npm ci --omit=dev

# Build for production with environment file
VITE_APP_URL=https://yourdomain.com npm run build

# Or use environment file
cp .env.production .env.local
npm run build:prod

# Start production server
npm run start:prod
```

### Option 3: Environment-Specific Build

```bash
# Create production environment file
echo "VITE_APP_URL=https://yourdomain.com" > .env.production.local

# Build with production environment
npm run build:prod

# Start server
npm run start:prod
```

## Environment Variables Required for Production

```bash
# Required - Supabase
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key

# Required - Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Required - Application URL (for email confirmations)
VITE_APP_URL=https://yourdomain.com
```

## Important: Email Confirmation Setup

### 1. Environment Configuration

The `VITE_APP_URL` environment variable is **critical** for email confirmations to work in production. This URL is used for:

- Email confirmation redirect links
- Password reset links
- Any authentication redirects

### 2. Supabase Dashboard Configuration

In your Supabase project dashboard:

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your production domain: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:5174/auth/callback` (for development)

### 3. Environment Files

Create environment files for different stages:

**Development (.env.local):**

```bash
VITE_APP_URL=http://localhost:5174
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

**Production (.env.production):**

```bash
VITE_APP_URL=https://yourdomain.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## Health Check

The application will be available at `http://localhost:3000`

## Security Considerations

- Use environment variables for all sensitive data
- Enable HTTPS in production
- Configure proper CORS settings
- Set up proper database security rules in Supabase
- Consider rate limiting for API endpoints
