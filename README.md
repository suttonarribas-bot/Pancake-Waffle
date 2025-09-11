# 🥞 Pancake vs Waffle Classifier 🧇

A static web application that classifies images as either pancakes or waffles using client-side JavaScript.

## ✨ Features
- **Client-side Classification**: JavaScript-based image analysis
- **No Server Required**: Pure static HTML/CSS/JavaScript
- **Sample Images**: Click to test with pre-loaded images
- **File Upload**: Upload your own images for classification
- **Real-time Analysis**: Edge detection and shape analysis
- **Confidence Scoring**: Based on image characteristics
- **Responsive Design**: Works on desktop and mobile

## How It Works

The classifier analyzes images using several computer vision techniques:

1. **Edge Detection**: Uses Canny edge detection to find patterns
2. **Grid Pattern Recognition**: Detects waffle grid patterns using Hough line detection
3. **Shape Analysis**: Analyzes aspect ratios to identify circular vs rectangular shapes
4. **Color Variation**: Examines color diversity (useful for detecting syrup/toppings)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/suttonarribas-bot/Pancake-Waffle.git
   cd Pancake-Waffle
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Add sample images**:
   - Create a `static/images/` directory
   - Add your pancake and waffle sample images to this directory
   - Name them according to the sample mapping in `app.py`

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:5000`
   - Start classifying images!

## File Structure

```
DataDemo/
├── index.html            # Main web interface
├── package.json          # Project configuration
├── README.md             # This file
├── Data/                 # Organized image dataset
│   ├── Pancakes/         # Pancake images (9 total)
│   └── Waffles/          # Waffle images (7 total)
├── static/               # Static assets
├── templates/            # Template files
└── uploads/              # Temporary upload directory (auto-created)
```

## API Endpoints

- `GET /` - Main web interface
- `POST /classify` - Classify uploaded image
- `GET /classify_sample/<sample_name>` - Classify sample image
- `GET /static/images/<filename>` - Serve static images

## Classification Rules

The classifier uses the following rules to distinguish pancakes from waffles:

1. **Grid Pattern Detection** (Waffle characteristic)
   - Uses Hough line detection to find grid patterns
   - High confidence for waffles

2. **Edge Density Analysis** (Waffle characteristic)
   - High edge density suggests waffle structure
   - Canny edge detection used

3. **Shape Analysis** (Pancake characteristic)
   - Circular shapes suggest pancakes
   - Rectangular shapes suggest waffles

4. **Color Variation** (Waffle characteristic)
   - High color variation suggests waffles with toppings/syrup

## Sample Images

The application includes sample images for testing:
- 9 Pancake examples (including chocolate chip, stack, and various styles)
- 7 Waffle examples (including brownie, corner cut, and various styles)

All images are organized in the `Data/` folder with separate subfolders for pancakes and waffles.

## Dependencies

- **Flask**: Web framework
- **OpenCV**: Computer vision library
- **Pillow**: Image processing
- **NumPy**: Numerical computing

## Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
For production deployment, consider using:
- **Gunicorn** as WSGI server
- **Nginx** as reverse proxy
- **Docker** for containerization

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Troubleshooting

### Common Issues

1. **Images not loading**: Ensure sample images are in `static/images/` directory
2. **Upload errors**: Check file size limits and supported formats
3. **Classification errors**: Verify OpenCV installation

### Debug Mode

Run with debug mode for detailed error messages:
```bash
export FLASK_DEBUG=1
python app.py
```

## Future Enhancements

- Machine learning model integration
- Batch image processing
- API rate limiting
- User authentication
- Classification history
- Mobile app integration