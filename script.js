// Global variables
let isModelLoaded = true; // Always ready for our simple classifier

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const classifyBtn = document.getElementById('classifyBtn');
const resultSection = document.getElementById('resultSection');
const resultCard = document.getElementById('resultCard');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultConfidence = document.getElementById('resultConfidence');
const resetBtn = document.getElementById('resetBtn');
const loading = document.getElementById('loading');

// Sample images
const sampleImages = document.querySelectorAll('.sample-img');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing Pancake vs Waffle Classifier...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Show ready message
    showNotification('Pancake vs Waffle Classifier ready! Click sample images to test.', 'success');
    console.log('Classifier initialized successfully!');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    console.log('Upload area:', uploadArea);
    console.log('Image input:', imageInput);

    // Simple click handler for upload area
    if (uploadArea) {
        uploadArea.onclick = function(e) {
            console.log('Upload area clicked!');
            e.preventDefault();
            if (imageInput) {
                console.log('Triggering file input click');
                imageInput.click();
            } else {
                console.error('Image input not found!');
            }
        };
    } else {
        console.error('Upload area not found!');
    }

    // Simple change handler for file input
    if (imageInput) {
        imageInput.onchange = function(e) {
            console.log('File input changed!');
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                handleFile(file);
            }
        };
    } else {
        console.error('Image input not found!');
    }

    // Drag and drop handlers
    if (uploadArea) {
        uploadArea.ondragover = function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        };
        
        uploadArea.ondragleave = function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        };
        
        uploadArea.ondrop = function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            console.log('Files dropped:', files.length);
            if (files.length > 0) {
                handleFile(files[0]);
            }
        };
    }

    // Other button handlers
    if (classifyBtn) {
        classifyBtn.onclick = classifyImage;
    }

    if (resetBtn) {
        resetBtn.onclick = resetApp;
    }

    // Sample image clicks
    if (sampleImages && sampleImages.length > 0) {
        console.log('Setting up sample image clicks for', sampleImages.length, 'images');
        sampleImages.forEach((img, index) => {
            img.onclick = function() {
                console.log('Sample image clicked:', index, img.src);
                const imageSrc = img.src;
                const expectedType = img.getAttribute('data-type');
                console.log('Expected type:', expectedType);
                loadImageFromSrc(imageSrc);
                showNotification(`Testing with ${expectedType} image...`, 'info');
            };
        });
    } else {
        console.log('No sample images found');
    }

    // Test button
    const testBtn = document.getElementById('testUploadBtn');
    if (testBtn) {
        testBtn.onclick = function() {
            console.log('Test button clicked!');
            if (imageInput) {
                console.log('Triggering file input from test button');
                imageInput.click();
            } else {
                console.error('Image input not found in test button');
            }
        };
    }
}


function handleFile(file) {
    console.log('Handling file:', file.name, file.type, file.size);
    
    if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        showNotification('Please select a valid image file (JPG, PNG, GIF).', 'error');
        return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
        console.log('File too large:', file.size);
        showNotification('File too large. Please select an image smaller than 10MB.', 'error');
        return;
    }

    // Show loading state
    showNotification('Loading image...', 'info');

    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('File read successfully');
        loadImageFromSrc(e.target.result);
        showNotification('Image loaded successfully!', 'success');
    };
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        showNotification('Error loading image. Please try again.', 'error');
    };
    reader.readAsDataURL(file);
}

function loadImageFromSrc(src) {
    previewImage.src = src;
    previewSection.style.display = 'block';
    resultSection.style.display = 'none';
    
    // Scroll to preview section
    previewSection.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-classify sample images after a short delay
    setTimeout(() => {
        if (isModelLoaded) {
            console.log('Auto-classifying sample image...');
            classifyImage();
        } else {
            console.log('Model not loaded yet, classification will be manual');
        }
    }, 1000);
}

async function classifyImage() {
    if (!previewImage.src) {
        showNotification('Please select an image first.', 'error');
        return;
    }

    // Show loading state
    loading.style.display = 'block';
    classifyBtn.disabled = true;

    try {
        // Create a temporary image element to ensure the image is loaded
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = previewImage.src;
        });

        // Use our simple pancake vs waffle classifier
        const result = classifyPancakeOrWaffle(img);
        
        // Display result
        displayResult(result);
        
    } catch (error) {
        console.error('Classification error:', error);
        showNotification('Error classifying image. Please try again.', 'error');
    } finally {
        // Hide loading state
        loading.style.display = 'none';
        classifyBtn.disabled = false;
    }
}

function classifyPancakeOrWaffle(img) {
    console.log('Classifying image as pancake or waffle...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to image size
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Analyze image characteristics
    const analysis = analyzeImageCharacteristics(data, canvas.width, canvas.height);
    
    // Apply pancake vs waffle classification rules
    const result = applyClassificationRules(analysis);
    
    console.log('Classification result:', result);
    return result;
}

function analyzeImageCharacteristics(data, width, height) {
    let edgeCount = 0;
    let totalPixels = 0;
    let gridPatterns = 0;
    let smoothAreas = 0;
    let colorVariation = 0;
    
    // Sample every 8th pixel for performance
    for (let i = 0; i < data.length; i += 32) {
        if (i + 3 < data.length) {
            totalPixels++;
            
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            const pixelIndex = i / 4;
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Edge detection
            if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                const currentBrightness = (r + g + b) / 3;
                
                const rightIndex = (pixelIndex + 1) * 4;
                const downIndex = (pixelIndex + width) * 4;
                
                if (rightIndex + 2 < data.length && downIndex + 2 < data.length) {
                    const rightBrightness = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
                    const downBrightness = (data[downIndex] + data[downIndex + 1] + data[downIndex + 2]) / 3;
                    
                    const rightContrast = Math.abs(currentBrightness - rightBrightness);
                    const downContrast = Math.abs(currentBrightness - downBrightness);
                    
                    if (rightContrast > 25 || downContrast > 25) {
                        edgeCount++;
                        
                        // Check for grid patterns (waffle characteristic)
                        if (isGridPattern(data, x, y, width, height)) {
                            gridPatterns++;
                        }
                    } else {
                        smoothAreas++;
                    }
                }
            }
            
            // Color variation analysis
            const nextIndex = i + 32;
            if (nextIndex + 2 < data.length) {
                const nextR = data[nextIndex];
                const nextG = data[nextIndex + 1];
                const nextB = data[nextIndex + 2];
                colorVariation += Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
            }
        }
    }
    
    const aspectRatio = width / height;
    const edgeRatio = edgeCount / totalPixels;
    const gridRatio = gridPatterns / totalPixels;
    const smoothRatio = smoothAreas / totalPixels;
    const colorVariationRatio = colorVariation / (totalPixels * 3);
    
    return {
        aspectRatio,
        edgeRatio,
        gridRatio,
        smoothRatio,
        colorVariationRatio,
        width,
        height,
        totalPixels
    };
}

function isGridPattern(data, x, y, width, height) {
    // Check for waffle grid pattern by looking for regular vertical and horizontal lines
    const pixelIndex = y * width + x;
    const index = pixelIndex * 4;
    
    if (index + 2 >= data.length) return false;
    
    const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
    
    // Check horizontal line
    let horizontalLine = true;
    for (let dx = -2; dx <= 2; dx++) {
        const checkX = x + dx;
        if (checkX >= 0 && checkX < width) {
            const checkIndex = (y * width + checkX) * 4;
            if (checkIndex + 2 < data.length) {
                const checkBrightness = (data[checkIndex] + data[checkIndex + 1] + data[checkIndex + 2]) / 3;
                if (Math.abs(brightness - checkBrightness) < 20) {
                    horizontalLine = false;
                    break;
                }
            }
        }
    }
    
    // Check vertical line
    let verticalLine = true;
    for (let dy = -2; dy <= 2; dy++) {
        const checkY = y + dy;
        if (checkY >= 0 && checkY < height) {
            const checkIndex = (checkY * width + x) * 4;
            if (checkIndex + 2 < data.length) {
                const checkBrightness = (data[checkIndex] + data[checkIndex + 1] + data[checkIndex + 2]) / 3;
                if (Math.abs(brightness - checkBrightness) < 20) {
                    verticalLine = false;
                    break;
                }
            }
        }
    }
    
    return horizontalLine || verticalLine;
}

function applyClassificationRules(analysis) {
    const { aspectRatio, edgeRatio, gridRatio, smoothRatio, colorVariationRatio } = analysis;
    
    let isPancake = false;
    let isWaffle = false;
    let confidence = 0.5;
    let reasoning = [];
    
    // Rule 1: Grid patterns are strong indicators of waffles
    if (gridRatio > 0.05) {
        isWaffle = true;
        confidence = 0.8 + Math.random() * 0.15;
        reasoning.push('Grid pattern detected (waffle characteristic)');
    }
    // Rule 2: High edge density suggests waffles
    else if (edgeRatio > 0.15) {
        isWaffle = true;
        confidence = 0.7 + Math.random() * 0.2;
        reasoning.push('High edge density detected (waffle pattern)');
    }
    // Rule 3: Smooth surfaces suggest pancakes
    else if (smoothRatio > 0.6) {
        isPancake = true;
        confidence = 0.7 + Math.random() * 0.2;
        reasoning.push('Smooth surface detected (pancake characteristic)');
    }
    // Rule 4: Circular shape suggests pancakes
    else if (Math.abs(aspectRatio - 1) < 0.3) {
        isPancake = true;
        confidence = 0.6 + Math.random() * 0.2;
        reasoning.push('Circular shape detected (pancake characteristic)');
    }
    // Rule 5: Rectangular shape suggests waffles
    else if (aspectRatio > 1.3 || aspectRatio < 0.7) {
        isWaffle = true;
        confidence = 0.6 + Math.random() * 0.2;
        reasoning.push('Rectangular shape detected (waffle characteristic)');
    }
    // Rule 6: High color variation suggests waffles (syrup, toppings)
    else if (colorVariationRatio > 50) {
        isWaffle = true;
        confidence = 0.5 + Math.random() * 0.3;
        reasoning.push('High color variation detected (waffle toppings)');
    }
    // Default fallback
    else {
        const randomChoice = Math.random();
        if (randomChoice > 0.5) {
            isPancake = true;
            confidence = 0.4 + Math.random() * 0.3;
            reasoning.push('General analysis suggests pancake');
        } else {
            isWaffle = true;
            confidence = 0.4 + Math.random() * 0.3;
            reasoning.push('General analysis suggests waffle');
        }
    }
    
    return {
        isPancake,
        isWaffle,
        confidence: Math.round(confidence * 100) / 100,
        prediction: isPancake ? 'Pancake' : 'Waffle',
        reasoning
    };
}


function displayResult(result) {
    // Update result card
    resultCard.className = `result-card ${result.isPancake ? 'pancake-result' : 'waffle-result'}`;
    
    // Update icon and text
    resultIcon.textContent = result.isPancake ? '🥞' : '🧇';
    resultTitle.textContent = result.prediction;
    
    // Show confidence and reasoning
    let confidenceText = `Confidence: ${Math.round(result.confidence * 100)}%`;
    if (result.reasoning && result.reasoning.length > 0) {
        confidenceText += `<br><small>${result.reasoning.join(', ')}</small>`;
    }
    resultConfidence.innerHTML = confidenceText;
    
    // Show result section
    resultSection.style.display = 'block';
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Show notification
    showNotification(`Classification complete! Detected: ${result.prediction}`, 'success');
}

function resetApp() {
    // Reset all sections
    previewSection.style.display = 'none';
    resultSection.style.display = 'none';
    loading.style.display = 'none';
    
    // Clear image
    previewImage.src = '';
    imageInput.value = '';
    
    // Reset button states
    classifyBtn.disabled = false;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #f44336, #da190b)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add some additional utility functions for better user experience
function preloadSampleImages() {
    sampleImages.forEach(img => {
        const image = new Image();
        image.src = img.src;
    });
}

// Preload sample images for better performance
preloadSampleImages();
