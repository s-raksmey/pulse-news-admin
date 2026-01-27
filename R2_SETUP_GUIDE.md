# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 storage for your image and video uploads.

## 🚀 Quick Start

### 1. Create a Cloudflare R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage** in the sidebar
3. Click **Create bucket**
4. Choose a unique bucket name (e.g., `my-app-media`)
5. Select a location close to your users
6. Click **Create bucket**

### 2. Generate R2 API Credentials

1. In the Cloudflare dashboard, go to **R2 Object Storage**
2. Click **Manage R2 API tokens**
3. Click **Create API token**
4. Configure the token:
   - **Token name**: `my-app-media-token`
   - **Permissions**: `Object Read & Write`
   - **Specify bucket**: Select your bucket
5. Click **Create API token**
6. **Important**: Copy and save the credentials immediately:
   - Access Key ID
   - Secret Access Key
   - Account ID (found in the right sidebar)

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env.local` and fill in your R2 credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your_custom_domain.com
```

**Where to find these values:**

- `R2_ACCOUNT_ID`: Found in your Cloudflare dashboard sidebar
- `R2_ACCESS_KEY_ID`: From the API token you created
- `R2_SECRET_ACCESS_KEY`: From the API token you created  
- `R2_BUCKET_NAME`: The name of your R2 bucket
- `R2_ENDPOINT`: Replace `your_account_id` with your actual account ID
- `R2_PUBLIC_URL`: (Optional) Your custom domain for file access

### 4. Set Up Public Access (Optional but Recommended)

For public file access, you have two options:

#### Option A: Use R2 Public Buckets
1. In your R2 bucket settings, enable **Public access**
2. Configure CORS settings if needed
3. Use the default R2 URL format

#### Option B: Use Custom Domain (Recommended)
1. In your R2 bucket settings, click **Connect domain**
2. Enter your custom domain (e.g., `files.yourdomain.com`)
3. Add the required DNS records to your domain
4. Update `R2_PUBLIC_URL` in your `.env.local`

### 5. Configure CORS (If Using Custom Domain)

Add CORS configuration to your R2 bucket:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3001"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the media management page:
   ```
   http://localhost:3001/media
   ```

3. Try uploading an image or video file

4. Check your R2 bucket to verify the file was uploaded

5. Verify the file URL works correctly

## 📁 File Structure

After setup, your files will be organized in R2 as:

```
your-bucket/
├── images/
│   ├── 1640995200000-abc123-photo.jpg
│   └── 1640995300000-def456-screenshot.png
├── videos/
│   ├── 1640995400000-ghi789-demo.mp4
│   └── 1640995500000-jkl012-tutorial.webm
└── documents/
    ├── 1640995600000-mno345-report.pdf
    └── 1640995700000-pqr678-manual.docx
```

## 🔧 Advanced Configuration

### Custom File Processing

You can customize image processing options in the upload API:

```typescript
const options: MediaUploadOptions = {
  folder: 'images',
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  alt: 'Image description',
  caption: 'Image caption',
  tags: ['tag1', 'tag2']
};
```

### File Size Limits

Current file size limits (configurable in `/api/media/upload/route.ts`):

- Images: 10MB
- Videos: 100MB
- Audio: 50MB
- Documents: 25MB
- Other: 10MB

### Supported File Types

**Images:**
- JPEG, PNG, GIF, WebP, SVG

**Videos:**
- MP4, WebM, OGG, AVI, MOV

**Audio:**
- MP3, WAV, OGG, M4A

**Documents:**
- PDF, DOC, DOCX, TXT, CSV

## 🛠️ Troubleshooting

### Common Issues

1. **"R2 storage is not properly configured" error**
   - Check that all environment variables are set correctly
   - Verify your R2 credentials are valid
   - Ensure your bucket exists

2. **Upload fails with permission error**
   - Verify your API token has `Object Read & Write` permissions
   - Check that the token is scoped to the correct bucket

3. **Files upload but URLs don't work**
   - Check your `R2_PUBLIC_URL` configuration
   - Verify your custom domain DNS settings
   - Ensure CORS is configured correctly

4. **Large file uploads fail**
   - Check file size limits in the upload API
   - Verify your R2 bucket has sufficient storage

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG_GRAPHQL=true
```

### Test Script

Run the test script to verify your configuration:

```bash
node test-r2-integration.js
```

## 💰 Cost Considerations

Cloudflare R2 pricing (as of 2024):

- **Storage**: $0.015 per GB per month
- **Class A operations** (writes): $4.50 per million requests
- **Class B operations** (reads): $0.36 per million requests
- **Egress**: Free (no bandwidth charges)

## 🔒 Security Best Practices

1. **Use least-privilege API tokens**
   - Only grant necessary permissions
   - Scope tokens to specific buckets

2. **Rotate credentials regularly**
   - Generate new API tokens periodically
   - Remove unused tokens

3. **Monitor usage**
   - Set up Cloudflare alerts for unusual activity
   - Review access logs regularly

4. **Use HTTPS only**
   - Always use HTTPS for file URLs
   - Configure secure CORS policies

## 📚 Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the Cloudflare R2 documentation
3. Check the browser console for error messages
4. Verify your environment variables are correct

---

**Happy uploading! 🎉**
