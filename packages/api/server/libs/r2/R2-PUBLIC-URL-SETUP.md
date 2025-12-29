# R2 Public URL Configuration Guide

## The Problem

Your current setup uses the R2 API endpoint for public file access:
```
❌ https://zaki-bucket-east.badb0d0f424577c6e4471ecdf4a4e6a7.r2.cloudflarestorage.com
```

This endpoint is **ONLY for S3 API operations** (PUT, DELETE, HEAD), **NOT for public HTTP access**!

**Why it fails:**
- Browser tries to GET (download) the image
- R2 API endpoint expects signed requests with specific signatures
- Result: `SignatureDoesNotMatch` error

## The Solution

Configure **public access** to your R2 bucket using one of these methods:

---

## Option 1: R2.dev Subdomain (Recommended for Testing)

### Pros:
- ✅ Free
- ✅ Quick setup (5 minutes)
- ✅ No DNS configuration needed
- ✅ Perfect for development/staging

### Cons:
- ⚠️ URL is not branded (`pub-hash.r2.dev`)
- ⚠️ Can't customize caching rules easily

### Setup Steps:

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **R2** → **Buckets**

2. **Select Your Bucket**
   - Click on `zaki-bucket-east`

3. **Enable Public Access**
   - Go to **Settings** tab
   - Find **Public Access** section
   - Click **Allow Access** or **Enable R2.dev subdomain**

4. **Copy Your Public URL**
   - You'll see something like: `https://pub-abc123def456.r2.dev`
   - Copy this URL

5. **Update Environment Variables**
   
   In all your `.env` files:
   
   ```bash
   # Dashboard (.env)
   R2_PUBLIC_URL=https://pub-abc123def456.r2.dev
   
   # Server (.env)
   R2_PUBLIC_URL=https://pub-abc123def456.r2.dev
   
   # Expo (.env)
   R2_PUBLIC_URL=https://pub-abc123def456.r2.dev
   ```

6. **Restart Your Apps**
   ```bash
   # Restart dashboard
   pnpm --filter dashboard dev
   
   # Restart server
   pnpm --filter server dev
   
   # Restart expo
   pnpm --filter zakipro start
   ```

---

## Option 2: Custom Domain (Recommended for Production)

### Pros:
- ✅ Branded URL (`cdn.zakipro.com`)
- ✅ Professional appearance
- ✅ Custom caching rules via Cloudflare
- ✅ Better for production/marketing

### Cons:
- ⚠️ Requires domain/subdomain
- ⚠️ Slightly more setup time

### Setup Steps:

1. **Choose a Subdomain**
   - Recommended: `cdn.zakipro.com` or `media.zakipro.com`

2. **Connect Domain to R2**
   - Go to Cloudflare Dashboard → R2 → `zaki-bucket-east`
   - Click **Settings** → **Custom Domains**
   - Click **Connect Domain**
   - Enter: `cdn.zakipro.com`
   - Click **Continue**

3. **Configure DNS** (if needed)
   - Cloudflare will automatically set up DNS if your domain is on Cloudflare
   - If not, add a CNAME record:
     ```
     CNAME cdn -> [target provided by Cloudflare]
     ```

4. **Wait for SSL Certificate**
   - Cloudflare automatically provisions SSL
   - Usually takes 1-5 minutes

5. **Update Environment Variables**
   ```bash
   R2_PUBLIC_URL=https://cdn.zakipro.com
   ```

6. **Restart Your Apps**

---

## Verification

After setup, verify your configuration:

### Test 1: Direct Browser Access

Try accessing a file directly:
```
https://pub-abc123.r2.dev/recipes/user123/image.jpg
```

You should see the image, not an XML error!

### Test 2: Check Environment Variable

In your API package:
```typescript
console.log('R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL);
```

Should output:
```
R2_PUBLIC_URL: https://pub-abc123.r2.dev
```

### Test 3: Upload New Image

1. Upload a new recipe image via your dashboard
2. Check the database - `recipes.imageUrl` should now be:
   ```
   ✅ https://pub-abc123.r2.dev/recipes/user123/image.jpg
   NOT
   ❌ https://zaki-bucket-east.badb...r2.cloudflarestorage.com/...
   ```

---

## Important Notes

### Public Access Security

**Q: Is it safe to enable public access?**

A: Yes! Because:
- ✅ Files are only accessible if someone knows the full URL
- ✅ URLs contain random IDs (e.g., `l0hs8h2xrgwwd0bkz2v8d7xr`)
- ✅ No directory listing is enabled
- ✅ You control what gets uploaded

**Best Practices:**
- Don't use predictable filenames
- Use UUIDs or random strings in paths
- Don't store sensitive documents in public buckets

### URL Format Examples

**Before (API Endpoint - WRONG for public access):**
```
https://zaki-bucket-east.badb0d0f424577c6e4471ecdf4a4e6a7.r2.cloudflarestorage.com/recipes/user/image.jpg
```

**After (R2.dev - CORRECT):**
```
https://pub-abc123def456.r2.dev/recipes/user/image.jpg
```

**After (Custom Domain - CORRECT):**
```
https://cdn.zakipro.com/recipes/user/image.jpg
```

---

## Fixing Existing Records

If you have existing recipes with wrong URLs in the database, you have two options:

### Option 1: Re-upload (Easiest)
- Edit each recipe
- Upload the image again
- New URL will be generated correctly

### Option 2: Bulk Update (For Many Records)

Create a migration script to update existing URLs:

```sql
-- Update all recipe image URLs
UPDATE recipes
SET "imageUrl" = REPLACE(
  "imageUrl",
  'https://zaki-bucket-east.badb0d0f424577c6e4471ecdf4a4e6a7.r2.cloudflarestorage.com',
  'https://pub-abc123def456.r2.dev'
)
WHERE "imageUrl" LIKE 'https://zaki-bucket-east%';

-- Same for ingredients
UPDATE ingredients
SET "imageUrl" = REPLACE(
  "imageUrl",
  'https://zaki-bucket-east.badb0d0f424577c6e4471ecdf4a4e6a7.r2.cloudflarestorage.com',
  'https://pub-abc123def456.r2.dev'
)
WHERE "imageUrl" LIKE 'https://zaki-bucket-east%';
```

---

## Troubleshooting

### Issue: "Public access is not enabled"

**Solution:**
- Go to bucket settings
- Enable R2.dev subdomain first
- Then try custom domain if needed

### Issue: "403 Forbidden" on custom domain

**Solution:**
- Check DNS is configured correctly
- Wait 5-10 minutes for SSL certificate
- Try R2.dev subdomain first to verify files are accessible

### Issue: Images still not loading

**Solution:**
1. Clear browser cache
2. Verify `R2_PUBLIC_URL` is set in ALL environment files
3. Restart all services
4. Check that new uploads use the new URL format
5. Update existing database records if needed

---

## Environment File Locations

Update `R2_PUBLIC_URL` in these files:

```
/home/syed/zaki-pro-app/
├── apps/
│   ├── dashboard/.env
│   ├── server/.env
│   └── expo/.env
└── packages/
    └── api/.env (if exists)
```

**Example:**
```bash
# Add or update this line in each .env file:
R2_PUBLIC_URL=https://pub-abc123def456.r2.dev
```

---

## Quick Start Checklist

- [ ] Enable R2.dev subdomain for `zaki-bucket-east` bucket
- [ ] Copy the public URL (e.g., `https://pub-xyz.r2.dev`)
- [ ] Update `R2_PUBLIC_URL` in all `.env` files
- [ ] Restart all services (dashboard, server, expo)
- [ ] Test by uploading a new image
- [ ] Verify the new image URL uses the public domain
- [ ] (Optional) Update existing database records
- [ ] (Optional) Set up custom domain for production

---

## Next Steps

After completing this setup:
1. ✅ Public URLs will work correctly
2. ✅ No more `SignatureDoesNotMatch` errors
3. ✅ CORS will work properly (if configured)
4. ✅ Images will load in browser, dashboard, and mobile app

**Remember:** You still need to configure CORS on the R2 bucket for cross-origin requests from your dashboard domain!

See: `README-CORS.md` for CORS configuration guide.
