// Global variables
let classifier = null;
let isModelLoaded = false;

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
    initializeApp();
});

async function initializeApp() {
    try {
        // Load the enhanced classifier
        console.log('Loading enhanced classifier...');
        classifier = new PancakeWaffleClassifier();
        const success = await classifier.loadModel();
        
        if (success) {
            isModelLoaded = true;
            console.log('Enhanced classifier loaded successfully!');
            
            // Set up event listeners
            setupEventListeners();
            
            // Show a success message
            showNotification('AI model loaded successfully! Ready to classify images.', 'success');
        } else {
            throw new Error('Failed to load classifier');
        }
    } catch (error) {
        console.error('Error loading model:', error);
        showNotification('Error loading AI model. Please refresh the page.', 'error');
    }
}

function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // File input change
    imageInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Classify button
    classifyBtn.addEventListener('click', classifyImage);

    // Reset button
    resetBtn.addEventListener('click', resetApp);

    // Sample image clicks
    sampleImages.forEach(img => {
        img.addEventListener('click', () => {
            const imageSrc = img.src;
            loadImageFromSrc(imageSrc);
        });
    });
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        loadImageFromSrc(e.target.result);
    };
    reader.readAsDataURL(file);
}

function loadImageFromSrc(src) {
    previewImage.src = src;
    previewSection.style.display = 'block';
    resultSection.style.display = 'none';
    
    // Scroll to preview section
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

async function classifyImage() {
    if (!isModelLoaded) {
        showNotification('AI model is still loading. Please wait...', 'error');
        return;
    }

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

        // Classify the image using enhanced classifier
        const result = await classifier.classifyImage(img);
        
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
