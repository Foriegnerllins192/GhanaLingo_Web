# Ghana Lingo - Vercel Deployment Guide

This guide explains how to deploy the Ghana Lingo platform to Vercel with a working backend.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. A MySQL database (you can use:
   - A local database exposed via tunnel
   - A cloud database like PlanetScale, Railway, or Supabase
   - A managed MySQL service from AWS, Google Cloud, or Azure)

## Deployment Steps

### 1. Prepare Your Project

The project is already configured for Vercel deployment with:
- Serverless API functions in the `/api` directory
- Static files served from the `/public` directory
- Proper routing configuration in `vercel.json`

### 2. Set Up Environment Variables

In your Vercel project settings, add the following environment variables:

```
# Database Configuration
MYSQL_HOST=your-database-host
MYSQL_USER=your-database-user
MYSQL_PASSWORD=your-database-password
MYSQL_DATABASE=your-database-name
MYSQL_PORT=3306
MYSQL_SSL=false  # Set to true if your database requires SSL

# Security Secrets
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
```

### 3. Database Setup

Ensure your MySQL database has the Ghana Lingo schema imported. You can use the `ghanalingo_schema.sql` file to set up the database structure.

### 4. Deploy to Vercel

You can deploy in two ways:

#### Option A: Using Vercel CLI
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to your project directory
3. Run: `vercel --prod`

#### Option B: Using GitHub Integration
1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the environment variables in Vercel dashboard
4. Deploy

## API Endpoints

After deployment, your API will be available at:

- POST `/api/register` - User registration
- POST `/api/login` - User login
- GET `/api/user` - Get user information
- POST `/api/logout` - User logout

## Frontend Configuration

The frontend is configured to use relative paths for API calls, so no changes are needed in the client-side code.

## Notes

1. Sessions are simplified for serverless deployment. For production use with multiple instances, consider using a shared session store like Redis.

2. File uploads (if used in your application) will need special handling for serverless environments.

3. The database connection pooling is optimized for serverless environments.

## Troubleshooting

If you encounter issues:

1. Check that all environment variables are correctly set
2. Verify database connectivity
3. Check Vercel logs for error details
4. Ensure your database schema matches the expected structure