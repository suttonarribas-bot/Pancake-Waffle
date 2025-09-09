# Deployment Guide

## GitHub Setup

1. **Create a new repository on GitHub:**
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it `pancake-waffle-classifier`
   - Make it public
   - Don't initialize with README (we already have one)

2. **Connect your local repository to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pancake-waffle-classifier.git
   git branch -M main
   git push -u origin main
   ```

3. **Update the repository URLs in package.json:**
   - Replace `yourusername` with your actual GitHub username in `package.json`

## Netlify Deployment

### Option 1: Automatic Deployment (Recommended)

1. **Connect to GitHub:**
   - Go to [Netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Choose "GitHub" as provider
   - Select your `pancake-waffle-classifier` repository

2. **Configure Build Settings:**
   - Build command: `echo 'No build step required'`
   - Publish directory: `.` (root directory)
   - Click "Deploy site"

3. **Custom Domain (Optional):**
   - Go to Site settings > Domain management
   - Add your custom domain if desired

### Option 2: Manual Deployment

1. **Build the site:**
   ```bash
   # No build step required - it's a static site
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify.com](https://netlify.com)
   - Drag and drop your project folder to the deploy area
   - Or use Netlify CLI: `netlify deploy --prod --dir .`

## Local Development

1. **Start a local server:**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Or using Node.js (if installed)
   npx serve .
   
   # Or using any other static file server
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:8000`

## Features Included

- ✅ Responsive design for mobile and desktop
- ✅ Drag and drop image upload
- ✅ AI-powered classification using TensorFlow.js
- ✅ Enhanced visual analysis for better accuracy
- ✅ Sample images for testing
- ✅ Modern UI with animations
- ✅ Real-time confidence scores
- ✅ Error handling and user feedback

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Notes

- The AI model loads asynchronously
- Images are processed client-side (no server required)
- Optimized for fast loading and classification
- Works offline after initial load

## Troubleshooting

### Common Issues:

1. **Model not loading:**
   - Check internet connection
   - Ensure CDN links are accessible
   - Try refreshing the page

2. **Images not uploading:**
   - Check file format (JPG, PNG, GIF supported)
   - Ensure file size is reasonable
   - Try a different browser

3. **Classification not working:**
   - Wait for model to fully load
   - Try with sample images first
   - Check browser console for errors

### Support:

- Check the browser console for error messages
- Ensure all files are properly uploaded to GitHub
- Verify Netlify deployment is successful
