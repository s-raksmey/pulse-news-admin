# Troubleshooting Guide

This guide covers common issues and solutions for the Pulse News application.

## Settings Issues

### ❌ "No Settings Found" Error

**Symptoms:**
- Settings page shows "No settings are available for the Site Configuration category"
- GraphQL server logs show: `Error: JSONObject cannot represent non-object value: *`

**Root Cause:**
Corrupted JSON data in the settings table (asterisks or invalid characters in the `value` field).

**Solutions:**

#### Solution 1: SQL Script Fix (Recommended)
```bash
# Run the provided SQL script
psql -d news_cms -U cms_user -f fix-settings.sql
```

#### Solution 2: GraphQL API Fix
1. Open your admin panel: http://localhost:3000
2. Open browser Developer Tools (F12)
3. Go to Application/Storage tab → localStorage
4. Copy your JWT token
5. Open browser console and run:
```javascript
// Replace YOUR_JWT_TOKEN with actual token
const JWT_TOKEN = 'YOUR_JWT_TOKEN';
// Then paste and run the fix-settings-graphql.js script
```

#### Solution 3: Manual Database Cleanup
```sql
-- Connect to database
psql -d news_cms -U cms_user

-- Check for corrupted settings
SELECT key, value FROM "Setting" WHERE value::text LIKE '%*%';

-- Delete corrupted settings
DELETE FROM "Setting" WHERE value::text LIKE '%*%';

-- Re-seed settings
\q
npm run seed
```

### ✅ Verification Steps
After fixing:
1. Restart your GraphQL server
2. Refresh the admin settings page
3. You should see 8 categories with 40+ settings total

---

## Article Category/Topic Issues

### ❌ Category/Topic Not Saving

**Symptoms:**
- Article form doesn't save selected category/topic
- Article list shows "—" for category/topic columns

**Debugging Steps:**

#### Step 1: Check Database Categories
```sql
-- Verify categories exist
SELECT * FROM "Category";

-- Check if articles have category assignments
SELECT title, "categoryId", topic FROM "Article";
```

#### Step 2: Test Article Creation
1. Go to: http://localhost:3000/articles/new
2. Fill in title and content
3. Select category from dropdown
4. Select topic from dropdown
5. Save article
6. Check if category/topic appear in article list

#### Step 3: Check GraphQL Logs
Look for these debug messages in your server console:
```
🔍 Category assignment debug: {
  requestedCategorySlug: 'tech',
  topic: 'artificial-intelligence',
  assignedCategory: { id: '...', slug: 'tech', name: 'Technology' },
  log: '✅ Found category: tech (Technology)'
}
```

#### Step 4: Verify Form State
Add this debug code to your article form:
```javascript
console.log('Form state:', {
  categorySlug,
  topic,
  categoryOptions,
  topicOptions
});
```

### ❌ Topics Not Loading

**Symptoms:**
- Topic dropdown is empty
- Topics don't change when category changes

**Solutions:**

#### Check MEGA_NAV Configuration
```javascript
// In src/data/mega-nav.ts
console.log('MEGA_NAV keys:', Object.keys(MEGA_NAV));
console.log('Topics for tech:', MEGA_NAV.tech?.explore?.items);
```

#### Verify Topic Extraction Logic
```javascript
// Test topic extraction
function extractTopics(categorySlug) {
  const cfg = MEGA_NAV[categorySlug];
  if (!cfg) return [];
  
  const allItems = [
    ...cfg.explore.items,
    ...cfg.shop.items,
    ...cfg.more.items,
  ];
  
  return Array.from(
    new Set(
      allItems
        .map((i) => i.href.split("/").pop())
        .filter((t) => Boolean(t))
    )
  );
}

console.log('Tech topics:', extractTopics('tech'));
```

---

## Database Connection Issues

### ❌ "Can't reach database server at localhost:5432"

**Solutions:**

#### Check PostgreSQL Status
```bash
# Windows
sc query postgresql-x64-14

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

#### Start PostgreSQL
```bash
# Windows
net start postgresql-x64-14

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

#### Verify Connection
```bash
# Test connection
psql -U cms_user -h localhost -d news_cms

# If successful, you should see:
# news_cms=>
```

### ❌ Authentication Failed

**Symptoms:**
- `FATAL: password authentication failed for user "cms_user"`

**Solutions:**

#### Reset User Password
```sql
-- Connect as superuser
psql -U postgres

-- Reset password
ALTER USER cms_user WITH PASSWORD 'CmsUser@0000';
```

#### Check pg_hba.conf
Ensure your PostgreSQL configuration allows local connections:
```
# Add this line to pg_hba.conf
local   all             cms_user                                md5
host    all             cms_user        127.0.0.1/32            md5
```

---

## GraphQL Server Issues

### ❌ Server Won't Start

**Common Causes:**

#### Port Already in Use
```bash
# Check what's using port 4000
netstat -an | grep 4000

# Kill process if needed (Windows)
taskkill /PID <process_id> /F

# Kill process (macOS/Linux)
kill -9 <process_id>
```

#### Missing Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables
Verify your `.env` file:
```env
DATABASE_URL="postgresql://cms_user:CmsUser%400000@localhost:5432/news_cms"
JWT_SECRET="your-secret-key-here"
```

### ❌ Authentication Errors

**Symptoms:**
- "Authentication required" errors
- JWT token issues

**Solutions:**

#### Check JWT Secret
Ensure `JWT_SECRET` is set in your `.env` file and matches between server and client.

#### Verify Token Format
In browser console:
```javascript
// Check localStorage for token
console.log('JWT Token:', localStorage.getItem('token'));
```

#### Test Authentication
```bash
# Test with curl
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ settings { id key } }"}'
```

---

## Frontend Issues

### ❌ Admin Panel Won't Load

**Check Network Tab:**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests to GraphQL endpoint

**Common Solutions:**
- Ensure GraphQL server is running on port 4000
- Check CORS configuration
- Verify authentication token

### ❌ Forms Not Submitting

**Debug Steps:**
1. Open browser console
2. Look for JavaScript errors
3. Check network requests
4. Verify form validation

---

## Performance Issues

### ❌ Slow Database Queries

**Solutions:**
- Add database indexes
- Optimize GraphQL queries
- Use database connection pooling

### ❌ Large Bundle Size

**Solutions:**
- Enable code splitting
- Optimize imports
- Use dynamic imports for heavy components

---

## Getting Help

### Debug Information to Collect:
1. **Server logs** (console output)
2. **Browser console errors**
3. **Network tab** (failed requests)
4. **Database query results**
5. **Environment variables** (without secrets)

### Useful Commands:
```bash
# Check server status
curl http://localhost:4000/graphql

# Check database
psql -d news_cms -U cms_user -c "SELECT COUNT(*) FROM \"Setting\";"

# View logs
tail -f server.log

# Test GraphQL query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ categories { id name slug } }"}'
```

### Contact Information:
- Check GitHub issues
- Review documentation
- Test with minimal reproduction case

