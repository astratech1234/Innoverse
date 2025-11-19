// Counter animation
function animateCounter(id, target) {
    const element = document.getElementById(id);
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20);
}

// Start counters on page load
window.onload = function() {
    animateCounter('co2Counter', 45678);
    animateCounter('wasteCounter', 123456);
    animateCounter('userCounter', 89234);
};

// Page navigation
function showPage(page) {
    // Hide all pages
    const pages = ['landingPage', 'loginPage', 'registerPage', 'dashboardPage', 'pickupPage', 
                   'aiEstimatorPage', 'aiBatteryPage', 'aiScanPage', 'mapPage', 'rewardsPage', 
                   'leaderboardPage', 'marketplacePage', 'sell-devicePage'];
    pages.forEach(p => {
        document.getElementById(p).classList.add('hidden');
    });

    // Show selected page
    document.getElementById(page + 'Page').classList.remove('hidden');

    // Toggle navbar visibility
    const navbar = document.getElementById('navbar');
    if (page === 'landing' || page === 'login' || page === 'register') {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Login function
function login() {
    const email = document.getElementById('loginEmail').value;
    const role = document.getElementById('loginRole').value;
    
    if (email) {
        const name = email.split('@')[0];
        document.getElementById('userName').textContent = name;
        showPage('dashboard');
    } else {
        alert('Please enter your email');
    }
}

// Register function
function register() {
    alert('Account created successfully! Please login.');
    showPage('login');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showPage('landing');
    }
}

// Schedule Pickup
function schedulePickup() {
    const device = document.getElementById('pickupDevice').value;
    const address = document.getElementById('pickupAddress').value;
    const date = document.getElementById('pickupDate').value;
    
    if (device && address && date) {
        alert('✅ Pickup scheduled successfully!\n\nDevice: ' + device + '\nDate: ' + date + '\n\nYou will receive a confirmation SMS shortly.');
        showPage('dashboard');
    } else {
        alert('Please fill all required fields');
    }
}

// AI Value Estimator
function estimateValue() {
    const device = document.getElementById('estimatorDevice').value;
    const brand = document.getElementById('estimatorBrand').value;
    const model = document.getElementById('estimatorModel').value;
    
    if (device && brand && model) {
        document.getElementById('estimatorResult').classList.add('show');
        document.getElementById('estimatorResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        alert('Please fill all required fields');
    }
}

// AI Battery Check
function checkBattery() {
    const batteryDevice = document.getElementById('batteryDevice').value;
    
    if (batteryDevice) {
        document.getElementById('batteryResult').classList.add('show');
        document.getElementById('batteryResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        alert('Please fill all required fields');
    }
}

// AI Scan Device
function scanDevice() {
    const imageInput = document.getElementById('scanImage');
    
    if (imageInput.files.length > 0) {
        // Show loading
        const btn = event.target;
        btn.innerHTML = '<div class="spinner"></div>';
        
        // Simulate AI processing
        setTimeout(() => {
            btn.textContent = 'Scan & Identify';
            document.getElementById('scanResult').classList.add('show');
            document.getElementById('scanResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 2000);
    } else {
        alert('Please upload an image');
    }
}

// Preview scan image
function previewScanImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Filter map locations
function filterMap(type) {
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // In a real app, this would filter the map markers
    console.log('Filtering map by:', type);
}

// Handle condition change in pickup form
function handleConditionChange() {
    const condition = document.getElementById('pickupCondition').value;
    const sellOption = document.getElementById('sellOption');
    
    if (condition === 'sell') {
        sellOption.classList.remove('hidden');
    } else {
        sellOption.classList.add('hidden');
    }
}

// List on Marketplace from pickup form
function listOnMarketplace() {
    const device = document.getElementById('pickupDevice').value;
    const price = document.getElementById('sellPrice').value;
    const description = document.getElementById('sellDescription').value;
    
    if (device && price && description) {
        alert('✅ Device listed on marketplace successfully!\n\nYou will be notified when buyers show interest. You\'ve earned 100 bonus points!');
        showPage('marketplace');
    } else {
        alert('Please fill all fields to list your device');
    }
}

// View product details
function viewProduct(productId) {
    alert('Product details page would open here!\n\nIn full version:\n- Detailed photos gallery\n- Complete specifications\n- Seller information\n- Buyer reviews\n- Contact seller button');
}

// Buy product
function buyProduct(productName, price) {
    if (confirm('Purchase ' + productName + ' for ₹' + price.toLocaleString() + '?\n\nPayment gateway will be integrated in production version.')) {
        alert('🎉 Order placed successfully!\n\nOrder ID: #ORD' + Math.floor(Math.random() * 100000) + '\n\nYou will receive delivery updates via SMS and email.\n\n✨ You\'ve earned 200 points for choosing refurbished!');
    }
}

// Submit device listing
function submitDeviceListing() {
    const deviceType = document.getElementById('sellDeviceType').value;
    const brand = document.getElementById('sellBrand').value;
    const model = document.getElementById('sellModel').value;
    const price = document.getElementById('sellAskingPrice').value;
    
    if (deviceType && brand && model && price) {
        alert('✅ Device listing published successfully!\n\nYour listing is now live on the marketplace.\n\n🎁 You\'ve earned 100 bonus points!\n\nBuyers can now contact you. We\'ll notify you via email when someone is interested.');
        showPage('marketplace');
    } else {
        alert('Please fill all required fields');
    }
}

// Redeem reward
function redeemReward(points) {
    const currentPoints = 2500; // This would come from user data
    
    if (currentPoints >= points) {
        if (confirm('Redeem ' + points + ' points for this reward?')) {
            alert('🎉 Reward redeemed successfully!\n\nYou will receive your voucher via email within 24 hours.');
            // Update points display
            const newPoints = currentPoints - points;
            document.getElementById('userPoints').textContent = newPoints.toLocaleString() + ' pts';
        }
    } else {
        alert('Insufficient points. Keep recycling to earn more!');
    }
}
