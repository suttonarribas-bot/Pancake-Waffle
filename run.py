#!/usr/bin/env python3
"""
Simple script to run the Pancake vs Waffle Classifier
"""

import os
import sys
import subprocess

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import cv2
        import numpy
        from PIL import Image
        print("✅ All dependencies are installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def main():
    """Main function to run the application"""
    print("🥞 Pancake vs Waffle Classifier 🧇")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check if sample images exist
    sample_dir = "static/images"
    if not os.path.exists(sample_dir):
        print(f"❌ Sample images directory not found: {sample_dir}")
        print("Please ensure sample images are in the correct location.")
        sys.exit(1)
    
    # Count sample images
    image_files = [f for f in os.listdir(sample_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    print(f"📸 Found {len(image_files)} sample images")
    
    # Create uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    
    print("\n🚀 Starting Flask application...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("⏹️  Press Ctrl+C to stop the server")
    print("=" * 40)
    
    # Run the Flask app
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
