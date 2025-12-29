# Cloudflare R2 CORS Configuration Guide

## Problem
Your Vercel-hosted dashboard cannot fetch images from your R2 bucket because the bucket lacks proper CORS (Cross-Origin Resource Sharing) headers.

**Error Message:**
```
Access to fetch at 'https://zaki-bucket-east.badb0d0f424577c6e4471ecdf4a4e6a7.r2.cloudflarestorage.com/...' 
from origin 'https://zaki-pro-app-dashboard.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

### Method 1: Via Cloudflare Dashboard (Recommended)

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Navigate to **R2** section

2. **Select Your Bucket**
   - Click on `zaki-bucket-east` (or your bucket name)

3. **Configure CORS**
   - Click on **Settings** tab
   - Scroll to **CORS Policy** section
   - Click **Add CORS policy** or **Edit**

4. **Paste the CORS Configuration**
   - Use the configuration from `cors-config.json` in this directory
   - Or copy the JSON below:

```json
[
  {
    "AllowedOrigins": [
      "https://zaki-pro-app-dashboard.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

5. **Save Changes**
   - Click **Save** or **Update**
   - Changes take effect immediately

### Method 2: Via Wrangler CLI

If you have Wrangler installed and configured:

```bash
# Navigate to the API package
cd /home/syed/zaki-pro-app/packages/api

# Apply CORS configuration
wrangler r2 bucket cors put zaki-bucket-east --file libs/r2/cors-config.json
```

### Method 3: Programmatically via AWS SDK

Currently not implemented in the codebase, but can be added if needed.

## CORS Configuration Explained

### AllowedOrigins
- **Production**: `https://zaki-pro-app-dashboard.vercel.app`
- **Development**: `http://localhost:3000` and `http://localhost:3001`
- Add more origins as your app grows (e.g., mobile app URLs, other dashboards)

### AllowedMethods
- **GET**: Fetch images/files
- **PUT/POST**: Upload files
- **DELETE**: Remove files
- **HEAD**: Check file existence/metadata

### AllowedHeaders
- `*` allows all headers (safe for this use case)
- You can restrict to specific headers like `Content-Type`, `Authorization` if needed

### ExposeHeaders
- **ETag**: Used for caching and versioning
- **Content-Length**: File size information

### MaxAgeSeconds
- **3600**: Browser caches the CORS preflight response for 1 hour
- Reduces OPTIONS requests and improves performance

## Wildcard Configuration (Use with Caution)

If you want to allow ALL origins (not recommended for production):

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

⚠️ **Security Warning**: Only use wildcard (`*`) for:
- Public read-only content
- Development/testing environments
- Non-sensitive data

## Testing CORS Configuration

After applying the CORS policy:

1. **Clear browser cache** (important!)
2. **Reload your dashboard**
3. **Check browser console** - CORS errors should be gone
4. **Verify image loading** - Images should display correctly

### Test with cURL

```bash
# Test CORS preflight request
curl -X OPTIONS \
  -H "Origin: https://zaki-pro-app-dashboard.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -I \
  "https://zaki-bucket-east.badb0d0f424577c6e4471ecdf4a4e6a7.r2.cloudflarestorage.com/recipes/test.jpg"
```

Expected response headers:
```
Access-Control-Allow-Origin: https://zaki-pro-app-dashboard.vercel.app
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, HEAD
Access-Control-Max-Age: 3600
```

## Troubleshooting

### CORS Still Not Working?

1. **Verify Bucket Name**: Ensure you're configuring the correct bucket
2. **Check Origin**: Make sure the dashboard URL matches exactly (including https://)
3. **Clear Cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Network Tab**: Look for OPTIONS preflight requests
5. **Verify Configuration**: Re-check the CORS policy in Cloudflare dashboard

### TypeScript Error Fix

The JavaScript error you're seeing:
```
Cannot read properties of undefined (reading 'name')
```

This is likely happening because the image failed to load (due to CORS), and your frontend code is trying to access properties of an undefined image object. After fixing CORS, this error should resolve automatically.

If it persists, check your frontend code where you're mapping over image data:
```typescript
// Add null checks
images?.map((img) => img?.name) // Safe
// vs
images.map((img) => img.name)   // Unsafe if images or img is undefined
```

## Adding New Origins

When you deploy to new environments:

1. **Update CORS config** with the new origin
2. **Reapply** the configuration via dashboard or CLI
3. **Test** the new environment

Example for adding Expo app:
```json
{
  "AllowedOrigins": [
    "https://zaki-pro-app-dashboard.vercel.app",
    "capacitor://localhost",  // For Capacitor/Expo mobile apps
    "http://localhost:3000"
  ]
}
```

## Security Best Practices

1. ✅ **List specific origins** instead of using `*`
2. ✅ **Limit methods** to what you actually need
3. ✅ **Use HTTPS** for production origins
4. ✅ **Set reasonable MaxAgeSeconds** (3600 is good)
5. ✅ **Review CORS policy** when adding new features
6. ❌ **Never use `*` wildcard** for sensitive data
7. ❌ **Don't allow unnecessary methods** like PUT/DELETE if only reading

## Resources

- [Cloudflare R2 CORS Documentation](https://developers.cloudflare.com/r2/buckets/cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AWS S3 CORS (Similar to R2)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

## Next Steps

1. Apply the CORS configuration using Method 1 (Dashboard) or Method 2 (CLI)
2. Test image loading on your dashboard
3. Verify the JavaScript error is resolved
4. Deploy confidently! 🚀
