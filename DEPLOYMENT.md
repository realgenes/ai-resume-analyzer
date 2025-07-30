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

# Build for production
npm run build:prod

# Start production server
npm run start:prod
```

## Environment Variables Required for Production

```bash
# Required - Supabase
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key

# Required - Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Health Check

The application will be available at `http://localhost:3000`

## Security Considerations

- Use environment variables for all sensitive data
- Enable HTTPS in production
- Configure proper CORS settings
- Set up proper database security rules in Supabase
- Consider rate limiting for API endpoints
