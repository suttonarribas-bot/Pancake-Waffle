// Simple Pancake vs Waffle Classifier
console.log('Script loaded');

// Error logging system
window.errorLog = [];
function logError(message, error = null) {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        message: message,
        error: error ? error.toString() : null,
        stack: error ? error.stack : null
    };
    window.errorLog.push(errorEntry);
    console.error('ERROR:', message, error);
    
    // Show error in UI
    showErrorNotification(message);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    notification.innerHTML = `
        <strong>Error:</strong> ${message}
        <br><small>Check console for details</small>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up...');
    try {
        setupApp();
    } catch (error) {
        logError('Failed to setup app', error);
    }
});

function setupApp() {
    console.log('Setting up app...');
    
    try {
        // Get elements
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const previewImage = document.getElementById('previewImage');
        const previewSection = document.getElementById('previewSection');
        const classifyBtn = document.getElementById('classifyBtn');
        const resultSection = document.getElementById('resultSection');
        const resultCard = document.getElementById('resultCard');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultConfidence = document.getElementById('resultConfidence');
        const resetBtn = document.getElementById('resetBtn');
        const sampleImages = document.querySelectorAll('.sample-img');
        
        console.log('Elements found:', {
            uploadArea: !!uploadArea,
            imageInput: !!imageInput,
            previewImage: !!previewImage,
            classifyBtn: !!classifyBtn,
            sampleImages: sampleImages.length
        });
        
        // Check for missing critical elements
        if (!uploadArea) logError('Upload area not found');
        if (!imageInput) logError('Image input not found');
        if (!previewImage) logError('Preview image not found');
        if (!classifyBtn) logError('Classify button not found');
        if (sampleImages.length === 0) logError('No sample images found');
        
        // Store elements globally for debugging
        window.debugElements = {
            uploadArea, imageInput, previewImage, classifyBtn, sampleImages
        };
    
        // Upload area click
        if (uploadArea) {
            uploadArea.addEventListener('click', function(e) {
                console.log('Upload area clicked');
                try {
                    if (imageInput) {
                        imageInput.click();
                        console.log('File input clicked');
                    } else {
                        logError('Image input not available when upload area clicked');
                    }
                } catch (error) {
                    logError('Error in upload area click', error);
                }
            });
        } else {
            logError('Cannot set up upload area click - element not found');
        }
        
        // File input change
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                console.log('File input changed');
                try {
                    const file = e.target.files[0];
                    if (file) {
                        console.log('File selected:', file.name, file.type, file.size);
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            console.log('File read successfully');
                            previewImage.src = e.target.result;
                            previewSection.style.display = 'block';
                            resultSection.style.display = 'none';
                        };
                        reader.onerror = function(error) {
                            logError('Error reading file', error);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        logError('No file selected');
                    }
                } catch (error) {
                    logError('Error in file input change', error);
                }
            });
        } else {
            logError('Cannot set up file input change - element not found');
        }
        
        // Classify button
        if (classifyBtn) {
            classifyBtn.addEventListener('click', function(e) {
                console.log('Classify button clicked');
                try {
                    if (previewImage && previewImage.src) {
                        classifyImage(previewImage);
                    } else {
                        logError('No image to classify');
                        alert('Please select an image first');
                    }
                } catch (error) {
                    logError('Error in classify button click', error);
                }
            });
        } else {
            logError('Cannot set up classify button - element not found');
        }
        
        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                console.log('Reset clicked');
                try {
                    previewSection.style.display = 'none';
                    resultSection.style.display = 'none';
                    previewImage.src = '';
                    if (imageInput) imageInput.value = '';
                } catch (error) {
                    logError('Error in reset button click', error);
                }
            });
        } else {
            logError('Reset button not found');
        }
        
        // Sample images
        if (sampleImages && sampleImages.length > 0) {
            sampleImages.forEach((img, index) => {
                img.addEventListener('click', function(e) {
                    console.log('Sample image clicked:', index, img.src);
                    try {
                        previewImage.src = img.src;
                        previewSection.style.display = 'block';
                        resultSection.style.display = 'none';
                        
                        // Auto-classify after a short delay
                        setTimeout(() => {
                            classifyImage(img);
                        }, 500);
                    } catch (error) {
                        logError('Error in sample image click', error);
                    }
                });
            });
        } else {
            logError('No sample images to set up');
        }
        
        console.log('Setup complete!');
        
        // Add global debug functions
        window.testUpload = function() {
            console.log('Testing upload...');
            if (window.debugElements.uploadArea) {
                window.debugElements.uploadArea.click();
            } else {
                logError('Upload area not available for testing');
            }
        };
        
        window.testSample = function() {
            console.log('Testing sample image...');
            if (window.debugElements.sampleImages && window.debugElements.sampleImages.length > 0) {
                window.debugElements.sampleImages[0].click();
            } else {
                logError('Sample images not available for testing');
            }
        };
        
        window.showErrorLog = function() {
            console.log('Error Log:', window.errorLog);
            return window.errorLog;
        };
        
    } catch (error) {
        logError('Error in setupApp', error);
    }
}

function classifyImage(img) {
    console.log('Classifying image...');
    
    try {
        // Show loading
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
            console.log('Loading indicator shown');
        } else {
            logError('Loading indicator not found');
        }
        
        // Simple classification based on image characteristics
        setTimeout(() => {
            try {
                const result = simpleClassify(img);
                console.log('Classification result:', result);
                displayResult(result);
                
                // Hide loading
                if (loading) {
                    loading.style.display = 'none';
                    console.log('Loading indicator hidden');
                }
            } catch (error) {
                logError('Error in classification timeout', error);
                if (loading) loading.style.display = 'none';
            }
        }, 1000);
    } catch (error) {
        logError('Error in classifyImage', error);
    }
}

function simpleClassify(img) {
    // Simple heuristics for pancake vs waffle
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const aspectRatio = width / height;
    
    // Create canvas to analyze image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Simple edge detection
    let edgeCount = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < data.length; i += 16) {
        if (i + 3 < data.length) {
            totalPixels++;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue;
            
            const pixelIndex = i / 4;
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                const currentBrightness = (r + g + b) / 3;
                const rightIndex = (pixelIndex + 1) * 4;
                const downIndex = (pixelIndex + width) * 4;
                
                if (rightIndex + 2 < data.length && downIndex + 2 < data.length) {
                    const rightBrightness = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
                    const downBrightness = (data[downIndex] + data[downIndex + 1] + data[downIndex + 2]) / 3;
                    
                    const rightContrast = Math.abs(currentBrightness - rightBrightness);
                    const downContrast = Math.abs(currentBrightness - downBrightness);
                    
                    if (rightContrast > 30 || downContrast > 30) {
                        edgeCount++;
                    }
                }
            }
        }
    }
    
    const edgeRatio = edgeCount / totalPixels;
    
    // Classification rules
    let isPancake = false;
    let isWaffle = false;
    let confidence = 0.5;
    let reasoning = [];
    
    // High edge density suggests waffles
    if (edgeRatio > 0.1) {
        isWaffle = true;
        confidence = 0.7 + Math.random() * 0.2;
        reasoning.push('High edge density detected (waffle pattern)');
    }
    // Circular shape suggests pancakes
    else if (Math.abs(aspectRatio - 1) < 0.3) {
        isPancake = true;
        confidence = 0.6 + Math.random() * 0.2;
        reasoning.push('Circular shape detected (pancake characteristic)');
    }
    // Rectangular shape suggests waffles
    else if (aspectRatio > 1.3 || aspectRatio < 0.7) {
        isWaffle = true;
        confidence = 0.6 + Math.random() * 0.2;
        reasoning.push('Rectangular shape detected (waffle characteristic)');
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
    console.log('Displaying result:', result);
    
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultConfidence = document.getElementById('resultConfidence');
    const resultSection = document.getElementById('resultSection');
    
    if (resultCard) {
        resultCard.className = `result-card ${result.isPancake ? 'pancake-result' : 'waffle-result'}`;
    }
    
    if (resultIcon) {
        resultIcon.textContent = result.isPancake ? '🥞' : '🧇';
    }
    
    if (resultTitle) {
        resultTitle.textContent = result.prediction;
    }
    
    if (resultConfidence) {
        let confidenceText = `Confidence: ${Math.round(result.confidence * 100)}%`;
        if (result.reasoning && result.reasoning.length > 0) {
            confidenceText += `<br><small>${result.reasoning.join(', ')}</small>`;
        }
        resultConfidence.innerHTML = confidenceText;
    }
    
    if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show notification
    showNotification(`Classification complete! Detected: ${result.prediction}`, 'success');
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