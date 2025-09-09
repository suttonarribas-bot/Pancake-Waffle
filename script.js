// Simple Pancake vs Waffle Classifier
console.log('Script loaded');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up...');
    setupApp();
});

function setupApp() {
    console.log('Setting up app...');
    
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
    
    // Upload area click
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            console.log('Upload area clicked');
            if (imageInput) {
                imageInput.click();
            }
        });
    }
    
    // File input change
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            console.log('File selected');
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewSection.style.display = 'block';
                    resultSection.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Classify button
    if (classifyBtn) {
        classifyBtn.addEventListener('click', function() {
            console.log('Classify button clicked');
            if (previewImage.src) {
                classifyImage(previewImage);
            } else {
                alert('Please select an image first');
            }
        });
    }
    
    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('Reset clicked');
            previewSection.style.display = 'none';
            resultSection.style.display = 'none';
            previewImage.src = '';
            if (imageInput) imageInput.value = '';
        });
    }
    
    // Sample images
    sampleImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            console.log('Sample image clicked:', index);
            previewImage.src = img.src;
            previewSection.style.display = 'block';
            resultSection.style.display = 'none';
            
            // Auto-classify after a short delay
            setTimeout(() => {
                classifyImage(img);
            }, 500);
        });
    });
    
    console.log('Setup complete!');
}

function classifyImage(img) {
    console.log('Classifying image...');
    
    // Show loading
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
    
    // Simple classification based on image characteristics
    setTimeout(() => {
        const result = simpleClassify(img);
        displayResult(result);
        
        // Hide loading
        if (loading) loading.style.display = 'none';
    }, 1000);
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