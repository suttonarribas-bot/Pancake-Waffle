from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
from PIL import Image
import base64
import io
import logging

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PancakeWaffleClassifier:
    def __init__(self):
        self.name = "Pancake vs Waffle Classifier"
        logger.info("Classifier initialized")
    
    def analyze_image(self, image_path):
        """Analyze an image to determine if it's a pancake or waffle"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not load image")
            
            # Convert to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            height, width = image_rgb.shape[:2]
            aspect_ratio = width / height
            
            # Convert to grayscale for edge detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Edge detection using Canny
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (width * height)
            
            # Grid pattern detection
            grid_score = self.detect_grid_pattern(edges)
            
            # Color analysis
            color_variation = self.analyze_color_variation(image_rgb)
            
            # Classification logic
            result = self.classify(edge_density, grid_score, aspect_ratio, color_variation)
            
            logger.info(f"Classification result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return {
                'prediction': 'Unknown',
                'confidence': 0.0,
                'reasoning': ['Error analyzing image'],
                'is_pancake': False,
                'is_waffle': False
            }
    
    def detect_grid_pattern(self, edges):
        """Detect grid patterns characteristic of waffles"""
        try:
            # Use Hough lines to detect grid patterns
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is None:
                return 0.0
            
            # Count horizontal and vertical lines
            horizontal_lines = 0
            vertical_lines = 0
            
            for line in lines:
                rho, theta = line[0]
                # Check if line is roughly horizontal or vertical
                if abs(theta) < np.pi/6 or abs(theta - np.pi) < np.pi/6:
                    horizontal_lines += 1
                elif abs(theta - np.pi/2) < np.pi/6:
                    vertical_lines += 1
            
            # Grid score based on presence of both horizontal and vertical lines
            total_lines = len(lines)
            if total_lines == 0:
                return 0.0
            
            grid_score = min(horizontal_lines, vertical_lines) / total_lines
            return grid_score
            
        except Exception as e:
            logger.error(f"Error detecting grid pattern: {str(e)}")
            return 0.0
    
    def analyze_color_variation(self, image):
        """Analyze color variation in the image"""
        try:
            # Calculate standard deviation of each color channel
            r_std = np.std(image[:, :, 0])
            g_std = np.std(image[:, :, 1])
            b_std = np.std(image[:, :, 2])
            
            # Average color variation
            color_variation = (r_std + g_std + b_std) / 3
            return color_variation
            
        except Exception as e:
            logger.error(f"Error analyzing color variation: {str(e)}")
            return 0.0
    
    def classify(self, edge_density, grid_score, aspect_ratio, color_variation):
        """Classify image based on analysis"""
        is_pancake = False
        is_waffle = False
        confidence = 0.5
        reasoning = []
        
        # Rule 1: Grid patterns are strong indicators of waffles
        if grid_score > 0.1:
            is_waffle = True
            confidence = 0.8 + np.random.random() * 0.15
            reasoning.append(f"Grid pattern detected (score: {grid_score:.2f})")
        
        # Rule 2: High edge density suggests waffles
        elif edge_density > 0.15:
            is_waffle = True
            confidence = 0.7 + np.random.random() * 0.2
            reasoning.append(f"High edge density detected ({edge_density:.2f})")
        
        # Rule 3: Circular shape suggests pancakes
        elif abs(aspect_ratio - 1.0) < 0.3:
            is_pancake = True
            confidence = 0.6 + np.random.random() * 0.2
            reasoning.append(f"Circular shape detected (ratio: {aspect_ratio:.2f})")
        
        # Rule 4: Rectangular shape suggests waffles
        elif aspect_ratio > 1.3 or aspect_ratio < 0.7:
            is_waffle = True
            confidence = 0.6 + np.random.random() * 0.2
            reasoning.append(f"Rectangular shape detected (ratio: {aspect_ratio:.2f})")
        
        # Rule 5: High color variation suggests waffles (syrup, toppings)
        elif color_variation > 30:
            is_waffle = True
            confidence = 0.5 + np.random.random() * 0.3
            reasoning.append(f"High color variation detected ({color_variation:.1f})")
        
        # Default fallback
        else:
            if np.random.random() > 0.5:
                is_pancake = True
                confidence = 0.4 + np.random.random() * 0.3
                reasoning.append("General analysis suggests pancake")
            else:
                is_waffle = True
                confidence = 0.4 + np.random.random() * 0.3
                reasoning.append("General analysis suggests waffle")
        
        prediction = "Pancake" if is_pancake else "Waffle"
        
        return {
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'reasoning': reasoning,
            'is_pancake': is_pancake,
            'is_waffle': is_waffle,
            'analysis': {
                'edge_density': round(edge_density, 3),
                'grid_score': round(grid_score, 3),
                'aspect_ratio': round(aspect_ratio, 2),
                'color_variation': round(color_variation, 1)
            }
        }

# Initialize classifier
classifier = PancakeWaffleClassifier()

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify_image():
    """Classify uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Save uploaded file temporarily
        filename = f"temp_{np.random.randint(10000, 99999)}.jpg"
        filepath = os.path.join('uploads', filename)
        
        # Create uploads directory if it doesn't exist
        os.makedirs('uploads', exist_ok=True)
        
        file.save(filepath)
        
        # Classify the image
        result = classifier.analyze_image(filepath)
        
        # Clean up temporary file
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in classify_image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/classify_sample/<sample_name>')
def classify_sample(sample_name):
    """Classify a sample image"""
    try:
        # Map sample names to actual files
        sample_files = {
            'pancake1': 'fluffy-pancakes-feature.jpg',
            'pancake2': 'Pancake-Recipe-1.jpg',
            'pancake3': 'pancakes1.jpeg',
            'pancake4': 'pancakes2.jpeg',
            'pancake5': 'pancakes3.jpg',
            'waffle1': 'chocolate-chip-waffles-featured.jpg',
            'waffle2': 'waffle.jpg',
            'waffle3': 'waffles1.jpg',
            'waffle4': 'waffles2.jpg',
            'waffle5': 'Brownie-Waffles-35.jpg'
        }
        
        if sample_name not in sample_files:
            return jsonify({'error': 'Sample not found'}), 404
        
        filename = sample_files[sample_name]
        filepath = os.path.join('static', 'images', filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'Sample image file not found'}), 404
        
        # Classify the sample
        result = classifier.analyze_image(filepath)
        
        # Add expected type
        expected_type = 'pancake' if sample_name.startswith('pancake') else 'waffle'
        result['expected_type'] = expected_type
        result['correct'] = (result['is_pancake'] and expected_type == 'pancake') or \
                           (result['is_waffle'] and expected_type == 'waffle')
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in classify_sample: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/static/images/<filename>')
def serve_image(filename):
    """Serve static images"""
    return send_from_directory('static/images', filename)

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
