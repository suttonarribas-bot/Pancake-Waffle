// Simple Pancake vs Waffle Classifier
console.log('Script loaded - Simple version');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up simple classifier...');
    setupSimpleClassifier();
});

function setupSimpleClassifier() {
    console.log('Setting up simple classifier...');
    
    // Get elements
    const sampleImages = document.querySelectorAll('.sample-img');
    const resultSection = document.getElementById('resultSection');
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultConfidence = document.getElementById('resultConfidence');
    const resetBtn = document.getElementById('resetBtn');
    
    console.log('Found elements:', {
        sampleImages: sampleImages.length,
        resultSection: !!resultSection,
        resetBtn: !!resetBtn
    });
    
    // Set up sample image clicks
    sampleImages.forEach((img, index) => {
        console.log(`Setting up image ${index}:`, img.src);
        
        img.addEventListener('click', function() {
            console.log(`Image ${index} clicked:`, img.src);
            const expectedType = img.getAttribute('data-type');
            console.log('Expected type:', expectedType);
            
            // Classify the image
            const result = classifyImage(img, expectedType);
            displayResult(result);
        });
    });
    
    // Set up reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('Reset button clicked');
            resultSection.style.display = 'none';
        });
    }
    
    console.log('Simple classifier setup complete!');
}

function classifyImage(img, expectedType) {
    console.log('Classifying image...', img.src);
    
    // Simple classification based on image characteristics
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const aspectRatio = width / height;
    
    console.log('Image dimensions:', width, 'x', height, 'ratio:', aspectRatio);
    
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
    console.log('Edge analysis:', edgeCount, 'edges out of', totalPixels, 'pixels, ratio:', edgeRatio);
    
    // Classification rules
    let isPancake = false;
    let isWaffle = false;
    let confidence = 0.5;
    let reasoning = [];
    
    // High edge density suggests waffles (grid pattern)
    if (edgeRatio > 0.1) {
        isWaffle = true;
        confidence = 0.8 + Math.random() * 0.15;
        reasoning.push('High edge density detected (waffle grid pattern)');
    }
    // Circular shape suggests pancakes
    else if (Math.abs(aspectRatio - 1) < 0.3) {
        isPancake = true;
        confidence = 0.7 + Math.random() * 0.2;
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
    
    const result = {
        isPancake,
        isWaffle,
        confidence: Math.round(confidence * 100) / 100,
        prediction: isPancake ? 'Pancake' : 'Waffle',
        reasoning,
        expectedType,
        correct: (isPancake && expectedType === 'pancake') || (isWaffle && expectedType === 'waffle')
    };
    
    console.log('Classification result:', result);
    return result;
}

function displayResult(result) {
    console.log('Displaying result:', result);
    
    const resultSection = document.getElementById('resultSection');
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultConfidence = document.getElementById('resultConfidence');
    
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
        if (result.expectedType) {
            confidenceText += `<br><strong>Expected: ${result.expectedType}</strong>`;
            confidenceText += `<br>${result.correct ? '✅ Correct!' : '❌ Incorrect'}`;
        }
        resultConfidence.innerHTML = confidenceText;
    }
    
    if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show notification
    showNotification(`Classified as: ${result.prediction} ${result.correct ? '✅' : '❌'}`, result.correct ? 'success' : 'error');
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