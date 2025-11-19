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
window.onload = function () {
    animateCounter('co2Counter', 45678);
    animateCounter('wasteCounter', 123456);
    animateCounter('userCounter', 89234);
};

// Setup scroll-based animations and navbar behaviour
function setupScrollEffects() {
    // IntersectionObserver for reveal animations
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (revealElements.length) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('revealed');
                    // support different reveal types
                    if (el.classList.contains('reveal-stagger')) {
                        el.classList.add('revealed');
                    }
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.12 });

        revealElements.forEach(el => io.observe(el));
    }

    // Navbar shrink on scroll
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => {
            if (window.scrollY > 80) navbar.classList.add('shrink');
            else navbar.classList.remove('shrink');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Hero parallax (subtle)
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const offset = Math.min(window.scrollY / 6, 80);
            hero.style.backgroundPosition = `center ${30 + offset}%`;
        }, { passive: true });
    }
}

// run setup once DOM is ready (after counters)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(setupScrollEffects, 200);
} else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(setupScrollEffects, 200));
}

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

    // Initialize map when opening map page (only once)
    if (page === 'map') {
        if (!window._mapInitialized) {
            if (typeof initMap === 'function') {
                initMap();
                window._mapInitialized = true;
            }
        }
        // give Leaflet a moment to render
        setTimeout(() => { if (window.map && window.map.invalidateSize) window.map.invalidateSize(); }, 300);
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

// ----------------- AI Value Estimator -----------------
const DEVICE_PROFILES = {
    smartphone: {
        label: 'Smartphone',
        basePrice: 4200,
        minPrice: 900,
        ageDepreciation: 0.09,
        minAgeFactor: 0.35,
        specBase: 128,
        specLabel: 'Storage (GB)',
        specPlaceholder: 'e.g., 128',
        specWeight: 0.004,
        batteryWeight: 0.65,
        accessoryBonus: { all: 250, basic: 120, none: 0 },
        co2Savings: 9,
        materialValue: 620,
        priority: 'High',
        tips: [
            'Check for screen cracks or Face ID issues before submitting.',
            'Higher storage variants and 5G models can fetch up to 8% extra.',
            'Include charger/box for better trust with recyclers.'
        ],
        materials: [
            { label: 'Precious Metals', icon: '🥇', percent: 0.15, description: 'Gold, silver & palladium traces' },
            { label: 'Battery Pack', icon: '🔋', percent: 0.25, description: 'Lithium-ion modules' },
            { label: 'Display & Glass', icon: '📱', percent: 0.3, description: 'OLED/LCD assembly' },
            { label: 'Frame & Copper', icon: '⚙️', percent: 0.2, description: 'Aluminium, copper & steel' },
            { label: 'Plastics & Others', icon: '♻️', percent: 0.1, description: 'Polymers, PCBs & misc.' }
        ]
    },
    laptop: {
        label: 'Laptop',
        basePrice: 10500,
        minPrice: 2500,
        ageDepreciation: 0.07,
        minAgeFactor: 0.4,
        specBase: 512,
        specLabel: 'Storage (GB)',
        specPlaceholder: 'e.g., 512 or 256',
        specWeight: 0.0025,
        batteryWeight: 0.55,
        accessoryBonus: { all: 400, basic: 200, none: 0 },
        co2Savings: 24,
        materialValue: 1350,
        priority: 'High',
        tips: [
            'Mention RAM/SSD upgrades for additional payout.',
            'Keys, hinges and trackpad condition influence grading.',
            'Factory reset + original charger add credibility.'
        ],
        materials: [
            { label: 'Aluminium & Copper', icon: '🧱', percent: 0.32, description: 'Chassis + heat sinks' },
            { label: 'Battery Modules', icon: '🔋', percent: 0.18, description: 'Lithium cells' },
            { label: 'Logic Boards', icon: '🧠', percent: 0.22, description: 'Motherboard & RAM' },
            { label: 'Display Assembly', icon: '🖥️', percent: 0.18, description: 'LCD/LED panel' },
            { label: 'Plastics', icon: '♻️', percent: 0.1, description: 'Keys & bezels' }
        ]
    },
    desktop: {
        label: 'Desktop',
        basePrice: 8000,
        minPrice: 2000,
        ageDepreciation: 0.08,
        minAgeFactor: 0.4,
        specBase: 1024,
        specLabel: 'Storage (GB)',
        specPlaceholder: 'e.g., 512 or 1024',
        specWeight: 0.0018,
        batteryWeight: 0.35,
        accessoryBonus: { all: 250, basic: 120, none: 0 },
        co2Savings: 21,
        materialValue: 980,
        priority: 'Medium',
        tips: [
            'Mention dedicated GPU model if present.',
            'Power supply, motherboard and HDD fetch most value.',
            'Bundle keyboard/mouse for smoother resale.'
        ],
        materials: [
            { label: 'Metals & Chassis', icon: '⚙️', percent: 0.35, description: 'Steel cases & copper' },
            { label: 'Circuit Boards', icon: '🧩', percent: 0.3, description: 'CPU, GPU & PCBs' },
            { label: 'Storage Units', icon: '💾', percent: 0.15, description: 'HDD/SSD recovery' },
            { label: 'Power Supply', icon: '🔌', percent: 0.12, description: 'Transformers' },
            { label: 'Plastic Panels', icon: '♻️', percent: 0.08, description: 'Front panels' }
        ]
    },
    tablet: {
        label: 'Tablet',
        basePrice: 5200,
        minPrice: 1200,
        ageDepreciation: 0.085,
        minAgeFactor: 0.35,
        specBase: 128,
        specLabel: 'Storage (GB)',
        specPlaceholder: 'e.g., 64 or 256',
        specWeight: 0.0035,
        batteryWeight: 0.6,
        accessoryBonus: { all: 220, basic: 120, none: 0 },
        co2Savings: 12,
        materialValue: 740,
        priority: 'Medium',
        tips: [
            'List pencil/keyboard accessories if included.',
            'Check for backlight bleed or dead pixels.',
            'LTE/5G variants have better recovery value.'
        ],
        materials: [
            { label: 'Display Assembly', icon: '📗', percent: 0.34, description: 'Glass + digitizer' },
            { label: 'Battery Pack', icon: '🔋', percent: 0.23, description: 'Lithium polymer' },
            { label: 'Logic Boards', icon: '🧠', percent: 0.18, description: 'PCB & chips' },
            { label: 'Frame Metals', icon: '⚒️', percent: 0.15, description: 'Aluminium frame' },
            { label: 'Other Components', icon: '♻️', percent: 0.1, description: 'Speakers, plastics' }
        ]
    },
    monitor: {
        label: 'Monitor / TV',
        basePrice: 3800,
        minPrice: 850,
        ageDepreciation: 0.07,
        minAgeFactor: 0.45,
        specBase: 24,
        specLabel: 'Screen Size (inches)',
        specPlaceholder: 'e.g., 24 or 32',
        specWeight: 0.03,
        batteryWeight: 0.2,
        usesBattery: false,
        accessoryBonus: { all: 150, basic: 80, none: 0 },
        co2Savings: 14,
        materialValue: 560,
        priority: 'Medium',
        tips: [
            'Mention resolution (FHD/4K) for better quotes.',
            'Check for dead pixels or burn-in.',
            'Stand/wall-mount availability influences logistics.'
        ],
        materials: [
            { label: 'Panel Glass', icon: '🖼️', percent: 0.4, description: 'LCD/OLED glass' },
            { label: 'Backlight Unit', icon: '💡', percent: 0.18, description: 'LED strips' },
            { label: 'Circuit Boards', icon: '🧩', percent: 0.2, description: 'T-Con & power boards' },
            { label: 'Metals & Frame', icon: '⚙️', percent: 0.12, description: 'Aluminium & steel' },
            { label: 'Plastics', icon: '♻️', percent: 0.1, description: 'Rear housing' }
        ]
    }
};

const CONDITION_MULTIPLIERS = {
    excellent: 1.0,
    good: 0.87,
    fair: 0.7,
    poor: 0.45
};

const ISSUE_MULTIPLIERS = {
    none: 1,
    cosmetic: 0.95,
    battery: 0.85,
    display: 0.6,
    hardware: 0.45
};

const ACCESSORY_FALLBACK = { all: 200, basic: 100, none: 0 };

const ACCESSORY_LABELS = {
    all: 'Charger + box',
    basic: 'Charger only',
    none: 'Missing accessories'
};

const BRAND_TIERS = [
    { label: 'Premium', factor: 1.15, keywords: ['apple', 'samsung', 'google', 'microsoft', 'sony', 'oneplus'] },
    { label: 'Business', factor: 1.1, keywords: ['dell', 'hp', 'lenovo', 'asus', 'lg', 'surface'] },
    { label: 'Mainstream', factor: 1.03, keywords: ['xiaomi', 'redmi', 'realme', 'oppo', 'vivo', 'motorola', 'acer', 'honor', 'nokia'] },
    { label: 'Budget', factor: 0.92, keywords: ['itel', 'lava', 'infinix', 'tecno', 'micromax'] }
];

const DEFAULT_MATERIALS = [
    { label: 'Metals & Frame', icon: '⚙️', percent: 0.3, description: 'Aluminium & copper parts' },
    { label: 'Circuit Boards', icon: '🧠', percent: 0.25, description: 'PCBs and chipsets' },
    { label: 'Battery Pack', icon: '🔋', percent: 0.2, description: 'Power modules' },
    { label: 'Display', icon: '🖥️', percent: 0.15, description: 'Glass assemblies' },
    { label: 'Plastics', icon: '♻️', percent: 0.1, description: 'Panels & casing' }
];

function estimateValue() {
    const deviceSelect = document.getElementById('estimatorDevice');
    const brandInput = document.getElementById('estimatorBrand');
    const modelInput = document.getElementById('estimatorModel');
    const conditionSelect = document.getElementById('estimatorCondition');
    const ageInput = document.getElementById('estimatorAge');
    const specInput = document.getElementById('estimatorSpec');
    const batteryInput = document.getElementById('estimatorBattery');
    const accessoriesSelect = document.getElementById('estimatorAccessories');
    const issuesSelect = document.getElementById('estimatorIssues');

    const deviceType = deviceSelect.value;
    const brand = brandInput.value.trim();
    const model = modelInput.value.trim();

    if (!deviceType) {
        alert('Please select a device type');
        return;
    }
    if (!brand || !model) {
        alert('Please enter both brand and model');
        return;
    }

    const profile = DEVICE_PROFILES[deviceType];
    if (!profile) {
        alert('Estimator coming soon for this device type.');
        return;
    }

    const conditionKey = conditionSelect.value;
    const age = parseFloat(ageInput.value || profile.defaultAge || 2);
    const specValue = parseFloat(specInput.value || profile.specBase);
    const batteryValue = parseFloat(batteryInput.value || 85);
    const accessoriesKey = accessoriesSelect.value;
    const issueKey = issuesSelect.value;

    if (isNaN(age) || age < 0) {
        alert('Please provide a valid device age');
        return;
    }
    if (isNaN(specValue) || specValue <= 0) {
        alert('Please provide a valid specification value');
        return;
    }
    if (isNaN(batteryValue) || batteryValue < 0 || batteryValue > 100) {
        alert('Battery health must be between 0 and 100');
        return;
    }

    let estimate = profile.basePrice;

    const conditionMultiplier = CONDITION_MULTIPLIERS[conditionKey] ?? 0.5;
    estimate *= conditionMultiplier;

    const ageMultiplier = Math.max(profile.minAgeFactor ?? 0.35, 1 - age * profile.ageDepreciation);
    estimate *= ageMultiplier;

    const specDelta = (specValue - profile.specBase) / profile.specBase;
    const specMultiplier = Math.max(0.6, 1 + specDelta * (profile.specWeight || 0.002));
    estimate *= specMultiplier;

    let batteryMultiplier = 1;
    if (profile.usesBattery !== false) {
        const normalizedBattery = clamp(batteryValue, 30, 100) / 100;
        batteryMultiplier = 0.6 + normalizedBattery * (profile.batteryWeight || 0.5);
        estimate *= batteryMultiplier;
    }

    const brandTier = getBrandTier(brand);
    estimate *= brandTier.factor;

    const issueMultiplier = ISSUE_MULTIPLIERS[issueKey] ?? 1;
    estimate *= issueMultiplier;

    const accessoriesBonus = getAccessoryBonus(profile, accessoriesKey);
    estimate += accessoriesBonus;

    estimate = Math.max(profile.minPrice, estimate);
    estimate = Math.round(estimate / 10) * 10;

    const summaryMultipliers = [
        `Condition (${conditionKey}) ×${conditionMultiplier.toFixed(2)}`,
        `Age impact (${age} yrs) ×${ageMultiplier.toFixed(2)}`,
        `Spec adjustment (${specValue} vs ${profile.specBase}) ×${specMultiplier.toFixed(2)}`
    ];

    if (profile.usesBattery !== false) {
        summaryMultipliers.push(`Battery health (${batteryValue}%) ×${batteryMultiplier.toFixed(2)}`);
    }

    summaryMultipliers.push(`Brand tier (${brandTier.label}) ×${brandTier.factor.toFixed(2)}`);

    if (issueKey !== 'none') {
        summaryMultipliers.push(`Issue penalty (${issueKey}) ×${issueMultiplier.toFixed(2)}`);
    }

    summaryMultipliers.push(`Accessories bonus +₹${formatINR(accessoriesBonus)}`);

    renderEstimatorResult({
        profile,
        estimate,
        brand,
        model,
        conditionLabel: conditionSelect.options[conditionSelect.selectedIndex].text,
        accessoriesLabel: ACCESSORY_LABELS[accessoriesKey] || 'Not specified',
        multipliers: summaryMultipliers,
        materialBreakdown: buildMaterialBreakdown(profile, estimate),
        co2Saved: profile.co2Savings || 10
    });
}

function buildMaterialBreakdown(profile, estimate) {
    const materials = profile.materials || DEFAULT_MATERIALS;
    return materials.map(item => {
        const portion = item.percent ?? 0.2;
        const recoveredValue = Math.max(80, Math.round(estimate * portion));
        return {
            icon: item.icon || '♻️',
            label: item.label,
            detail: `${item.description || 'Recovered materials'} · ₹${formatINR(recoveredValue)}`
        };
    });
}

function getAccessoryBonus(profile, key) {
    if (!key) return 0;
    if (profile.accessoryBonus && typeof profile.accessoryBonus[key] !== 'undefined') {
        return profile.accessoryBonus[key];
    }
    return ACCESSORY_FALLBACK[key] ?? 0;
}

function getBrandTier(brand) {
    const normalized = brand.trim().toLowerCase();
    if (!normalized) return { label: 'Standard', factor: 1 };
    for (const tier of BRAND_TIERS) {
        if (tier.keywords.some(keyword => normalized.includes(keyword))) {
            return { label: tier.label, factor: tier.factor };
        }
    }
    return { label: 'Standard', factor: 1 };
}

function formatINR(value, decimals = 0) {
    const amount = Number.isFinite(value) ? value : 0;
    return amount.toLocaleString('en-IN', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function selectEstimatorDevice(type, el) {
    const selector = document.getElementById('estimatorDevice');
    if (selector) {
        selector.value = type;
    }

    document.querySelectorAll('.device-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.device === type);
    });

    updateEstimatorSpecLabel(type);
    updateEstimatorInfoPanel(type);

    if (el) {
        el.blur();
    }
}

function updateEstimatorSpecLabel(type) {
    const labelEl = document.getElementById('estimatorSpecLabel');
    const specInput = document.getElementById('estimatorSpec');
    const profile = DEVICE_PROFILES[type];
    if (labelEl && profile) {
        labelEl.textContent = profile.specLabel || 'Storage (GB)';
    }
    if (specInput && profile) {
        specInput.placeholder = profile.specPlaceholder || 'e.g., 128';
    }
}

function updateEstimatorInfoPanel(type) {
    const profile = DEVICE_PROFILES[type];
    const titleEl = document.getElementById('estimatorInfoTitle');
    const listEl = document.getElementById('estimatorInfoList');
    const tagsEl = document.getElementById('estimatorInfoTags');

    if (!profile) return;

    if (titleEl) titleEl.textContent = `${profile.label} insights`;
    if (listEl) {
        listEl.innerHTML = (profile.tips || []).map(tip => `<li>${tip}</li>`).join('');
    }
    if (tagsEl) {
        tagsEl.innerHTML = `
            <span>Avg CO₂ savings: ${profile.co2Savings || 10} kg</span>
            <span>Material recovery: ₹${formatINR(profile.materialValue || 500)}</span>
            <span>Processing priority: ${profile.priority || 'Medium'}</span>
        `;
    }
}

function renderEstimatorResult(payload) {
    const resultDiv = document.getElementById('estimatorResult');
    if (!resultDiv) return;

    const materialHtml = payload.materialBreakdown.map(item => `
        <div class="material-item">
            <div style="font-weight:600; color:#333">${item.icon} ${item.label}</div>
            <div style="color:#666">${item.detail}</div>
        </div>
    `).join('');

    const multipliersHtml = payload.multipliers.map(entry => `<li>${entry}</li>`).join('');

    resultDiv.innerHTML = `
        <div class="estimator-header">
            <div>
                <div class="estimator-label">Estimated recyclable value</div>
                <div class="estimator-price">₹${formatINR(payload.estimate)}</div>
                <div class="estimator-points">≈ ${formatINR(Math.round(payload.estimate))} reward points</div>
            </div>
            <div class="estimator-chip">CO₂ saved ≈ ${payload.co2Saved} kg</div>
        </div>
        <div class="estimator-summary">
            <div class="summary-item">
                <span class="summary-label">Device</span>
                <span class="summary-value">${payload.profile.label}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Model</span>
                <span class="summary-value">${payload.brand} ${payload.model}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Condition</span>
                <span class="summary-value">${payload.conditionLabel}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Accessories</span>
                <span class="summary-value">${payload.accessoriesLabel}</span>
            </div>
        </div>
        <h4 style="margin-bottom:0.75rem">Material Breakdown</h4>
        <div class="value-breakdown">
            ${materialHtml}
        </div>
        <div class="estimator-impact">
            <strong>How the AI scored your device</strong>
            <ul style="margin:0; padding-left:1.25rem">
                ${multipliersHtml}
            </ul>
        </div>
        <div class="estimator-actions">
            <button class="btn btn-primary" onclick="showPage('pickup')">Schedule Pickup</button>
            <button class="btn btn-secondary" onclick="showPage('marketplace')">List on Marketplace</button>
        </div>
    `;

    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('estimatorDevice');
    if (selector) {
        selectEstimatorDevice(selector.value || 'smartphone');
    }
});

// Quick material price calculator used in AI Estimator page
function calculatePrice() {
    const material = document.getElementById('priceMaterial').value;
    const quantity = parseFloat(document.getElementById('priceQuantity').value);
    const condition = document.getElementById('priceCondition').value;

    if (!material || !quantity || quantity <= 0) {
        alert('Please fill all fields correctly!');
        return;
    }

    const resultsDiv = document.getElementById('priceResults');

    // Base prices per kg (in Rupees)
    const basePrices = {
        batteries: 110,
        circuit: 140,
        metal: 95,
        plastic: 45,
        led: 105,
        cables: 75,
        gold: 3500
    };

    const conditionMultiplier = {
        'Excellent': 1.0,
        'Good': 0.9,
        'Fair': 0.75,
        'Poor': 0.5
    };

    const unitPrice = basePrices[material];
    if (typeof unitPrice === 'undefined') {
        alert('Unknown material selected');
        return;
    }

    const multiplier = conditionMultiplier[condition] || 1.0;
    const total = unitPrice * quantity * multiplier;

    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <div style="font-weight:600; margin-bottom:0.25rem">Estimated Price</div>
        <div style="font-size:1.25rem; color:#28a745; font-weight:700">₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        <div style="color:#666; font-size:0.9rem; margin-top:0.5rem">Unit price: ₹${unitPrice.toLocaleString('en-IN')}/kg · Quantity: ${quantity} kg · Condition: ${condition} (×${multiplier})</div>
    `;
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        reader.onload = function (e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Filter map locations
// Map and filtering implementation using Leaflet
function initMap() {
    // Load Leaflet JS dynamically
    if (typeof L === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => { createMap(); };
        document.body.appendChild(script);
    } else {
        createMap();
    }

    function createMap() {
        // center on Nagpur, Maharashtra
        window.map = L.map('map').setView([21.1458, 79.0882], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.map);

        // sample locations across India with category: 'bins' | 'centers' | 'battery'
        window._mapMarkers = [];
        const locations = [
            { name: 'Mumbai E-Waste Hub', city: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'centers' },
            { name: 'Delhi Recycling Center (Okhla)', city: 'New Delhi', lat: 28.5500, lng: 77.2670, type: 'centers' },
            { name: 'Bengaluru E-Waste Bin (Koramangala)', city: 'Bengaluru', lat: 12.9352, lng: 77.6245, type: 'bins' },
            { name: 'Chennai Battery Collection', city: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'battery' },
            { name: 'Kolkata E-Waste Center', city: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'centers' },
            { name: 'Hyderabad E-Waste Bin (Hitech City)', city: 'Hyderabad', lat: 17.4415, lng: 78.3916, type: 'bins' },
            { name: 'Pune Recycling Depot', city: 'Pune', lat: 18.5204, lng: 73.8567, type: 'centers' },
            { name: 'Ahmedabad Battery Depot', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, type: 'battery' },
            { name: 'Jaipur E-Waste Bin', city: 'Jaipur', lat: 26.9124, lng: 75.7873, type: 'bins' },
            { name: 'Lucknow Recycling Center', city: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'centers' },
            { name: 'Kanpur Battery Recycling', city: 'Kanpur', lat: 26.4499, lng: 80.3319, type: 'battery' },
            { name: 'Surat E-Waste Bin', city: 'Surat', lat: 21.1702, lng: 72.8311, type: 'bins' },
            { name: 'Indore Recycling Hub', city: 'Indore', lat: 22.7196, lng: 75.8577, type: 'centers' },
            { name: 'Bhopal Battery Collection', city: 'Bhopal', lat: 23.2599, lng: 77.4126, type: 'battery' },
            { name: 'Coimbatore E-Waste Center', city: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'centers' },
            { name: 'Kochi Battery Depot', city: 'Kochi', lat: 9.9312, lng: 76.2673, type: 'battery' },
            { name: 'Guwahati E-Waste Bin', city: 'Guwahati', lat: 26.1445, lng: 91.7362, type: 'bins' },
            { name: 'Nagpur Central Collection', city: 'Nagpur', lat: 21.1458, lng: 79.0882, type: 'centers' },
            { name: 'Thiruvananthapuram Battery Rescue', city: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, type: 'battery' },
            { name: 'Visakhapatnam Recycling Center', city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, type: 'centers' },
            { name: 'Noida E-Waste Bin', city: 'Noida', lat: 28.5355, lng: 77.3910, type: 'bins' },
            { name: 'Faridabad Battery Collection', city: 'Faridabad', lat: 28.4089, lng: 77.3178, type: 'battery' },
            { name: 'Vijayawada E-Waste Center', city: 'Vijayawada', lat: 16.5062, lng: 80.6480, type: 'centers' },
            { name: 'Mysuru E-Waste Bin', city: 'Mysuru', lat: 12.2958, lng: 76.6394, type: 'bins' },
            { name: 'Vadodara Recycling Depot', city: 'Vadodara', lat: 22.3072, lng: 73.1812, type: 'centers' }
        ];

        locations.forEach(loc => {
            const marker = L.marker([loc.lat, loc.lng]).addTo(window.map);
            const popupHtml = `<strong>${loc.name}</strong><br/><em>${loc.city}</em><br/>Type: ${loc.type}`;
            marker.bindPopup(popupHtml);
            marker._etype = loc.type;
            window._mapMarkers.push(marker);
        });
    }
}

function filterMap(type, btn) {
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.remove('active'));

    // Add active class to clicked button (if provided)
    if (btn) btn.classList.add('active');

    // If markers not initialized yet just return
    if (!window._mapMarkers || window._mapMarkers.length === 0) return;

    if (type === 'all') {
        window._mapMarkers.forEach(m => { if (!window.map.hasLayer(m)) m.addTo(window.map); });
    } else {
        window._mapMarkers.forEach(m => {
            if (m._etype === type) {
                if (!window.map.hasLayer(m)) m.addTo(window.map);
            } else {
                if (window.map.hasLayer(m)) window.map.removeLayer(m);
            }
        });
    }
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
        const imagesCount = (window._sellImages && window._sellImages.length) ? window._sellImages.length : 0;
        alert('✅ Device listing published successfully!\n\nYour listing is now live on the marketplace.\n\nImages attached: ' + imagesCount + '\n\n🎁 You\'ve earned 100 bonus points!\n\nBuyers can now contact you. We\'ll notify you via email when someone is interested.');
        // clear temp images
        window._sellImages = [];
        const preview = document.getElementById('sellPreview'); if (preview) preview.innerHTML = '';
        showPage('marketplace');
    } else {
        alert('Please fill all required fields');
    }
}

// ----------------- Sell Device Images & Camera -----------------
window._sellImages = [];

function handleSellImages(input) {
    if (!input.files || input.files.length === 0) return;
    const maxFiles = 5;
    const toAdd = Array.from(input.files).slice(0, maxFiles - window._sellImages.length);
    toAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            window._sellImages.push({ name: file.name, data: e.target.result });
            renderSellPreview();
        };
        reader.readAsDataURL(file);
    });
    // reset input so same file can be chosen again if removed
    input.value = '';
}

function renderSellPreview() {
    const container = document.getElementById('sellPreview');
    if (!container) return;
    container.innerHTML = '';
    window._sellImages.forEach((img, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'preview-thumb-wrapper';
        const image = document.createElement('img');
        image.src = img.data;
        image.className = 'preview-thumb';
        wrap.appendChild(image);
        const btn = document.createElement('button');
        btn.className = 'preview-remove';
        btn.title = 'Remove photo';
        btn.innerHTML = '✕';
        btn.onclick = () => { window._sellImages.splice(idx, 1); renderSellPreview(); };
        wrap.appendChild(btn);
        container.appendChild(wrap);
    });
}

// Camera (desktop) capture
async function openCameraForSell() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    if (!modal || !video) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        window._cameraStream = stream;
        video.srcObject = stream;
        modal.classList.remove('hidden');
    } catch (err) {
        alert('Unable to access camera: ' + err.message);
    }
}

function closeCamera() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    if (window._cameraStream) {
        window._cameraStream.getTracks().forEach(t => t.stop());
        window._cameraStream = null;
    }
    if (video) video.srcObject = null;
    if (modal) modal.classList.add('hidden');
}

function captureFromCamera() {
    const video = document.getElementById('cameraVideo');
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    if (!window._sellImages) window._sellImages = [];
    if (window._sellImages.length >= 5) {
        alert('Maximum 5 photos allowed');
        return;
    }
    window._sellImages.push({ name: 'camera-' + Date.now() + '.jpg', data: dataUrl });
    renderSellPreview();
    // optionally close camera after capture
    closeCamera();
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