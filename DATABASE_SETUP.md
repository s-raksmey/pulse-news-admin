# Database Setup Guide

This guide will help you set up and troubleshoot your PostgreSQL database for the Pulse News application.

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- Access to your database credentials

## Database Configuration

Your `.env` file should contain:
```env
DATABASE_URL="postgresql://cms_user:CmsUser%400000@localhost:5432/news_cms"
```

## Setup Steps

### 1. Start PostgreSQL Service

**Windows:**
```bash
# Start PostgreSQL service
net start postgresql-x64-14
# OR if using PostgreSQL service
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo service postgresql start
# OR
sudo systemctl start postgresql
```

### 2. Create Database and User

Connect to PostgreSQL as superuser:
```bash
psql -U postgres
```

Create database and user:
```sql
-- Create database
CREATE DATABASE news_cms;

-- Create user
CREATE USER cms_user WITH PASSWORD 'CmsUser@0000';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE news_cms TO cms_user;

-- Connect to the database
\c news_cms

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO cms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cms_user;

-- Exit
\q
```

### 3. Run Database Migrations

```bash
cd pulse-news-server
npm install
npx prisma migrate dev
```

### 4. Seed the Database

```bash
npm run seed
```

Expected output:
```
🌱 Seeding categories from MEGA_NAV...
✅ Categories seeded
🌱 Seeding default settings...
✅ 42 settings seeded
✅ Sample article created
```

### 5. Verify Setup

Test database connection:
```bash
npx prisma studio
```

This should open Prisma Studio at http://localhost:5555 where you can view your data.

## Troubleshooting

### Issue: "Can't reach database server at localhost:5432"

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql-x64-14
   
   # macOS/Linux
   ps aux | grep postgres
   ```

2. Check if port 5432 is in use:
   ```bash
   netstat -an | grep 5432
   ```

3. Verify connection string in `.env`

### Issue: "JSONObject cannot represent non-object value: *"

This indicates corrupted settings data. Use one of these fixes:

**Option 1: SQL Script**
```bash
psql -d news_cms -U cms_user -f fix-settings.sql
```

**Option 2: Delete and Re-seed**
```sql
-- Connect to database
psql -d news_cms -U cms_user

-- Delete corrupted settings
DELETE FROM "Setting";

-- Exit and re-seed
\q
npm run seed
```

### Issue: "Permission denied for table"

Grant proper permissions:
```sql
-- Connect as superuser
psql -U postgres -d news_cms

-- Grant all permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cms_user;
GRANT USAGE ON SCHEMA public TO cms_user;
```

### Issue: Categories not showing in forms

1. Check if categories were seeded:
   ```sql
   SELECT * FROM "Category";
   ```

2. If empty, run seed script:
   ```bash
   npm run seed
   ```

## Database Schema Overview

### Key Tables:
- **User**: Admin users and authors
- **Category**: Article categories (tech, politics, etc.)
- **Topic**: Sub-categories within each category
- **Article**: Main content with category/topic relationships
- **Setting**: Application configuration (40+ settings)

### Relationships:
- Article → Category (many-to-one)
- Topic → Category (many-to-one)
- Article → User (many-to-one, author)

## Environment Variables

Required environment variables:
```env
DATABASE_URL="postgresql://cms_user:CmsUser%400000@localhost:5432/news_cms"
JWT_SECRET="your-jwt-secret-here"
```

## Backup and Restore

### Create Backup:
```bash
pg_dump -U cms_user -h localhost news_cms > backup.sql
```

### Restore Backup:
```bash
psql -U cms_user -h localhost news_cms < backup.sql
```

## Production Considerations

1. **Use environment-specific databases**
2. **Enable SSL connections**
3. **Set up regular backups**
4. **Monitor database performance**
5. **Use connection pooling**

## Support

If you encounter issues not covered here:
1. Check the application logs
2. Verify all environment variables
3. Ensure PostgreSQL version compatibility (12+)
4. Check firewall settings for port 5432

