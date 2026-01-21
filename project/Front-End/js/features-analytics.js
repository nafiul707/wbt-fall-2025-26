// ============================================
// UNIQUE FEATURES: ANALYTICS, BUDGET TRACKER, ACHIEVEMENTS
// ============================================

// Storage keys for new features
const BUDGET_STORAGE_KEY = 'touristBudget';
const EXPENSES_STORAGE_KEY = 'touristExpenses';
const ACHIEVEMENTS_STORAGE_KEY = 'touristAchievements';

let budgetData = { monthly: 0, currency: 'USD' };
let expenses = [];
let achievements = { points: 0, level: 'Beginner', badges: [] };
let spendingChart = null;
let trendChart = null;
let countrySpendingChart = null;

// Initialize new features
function initializeNewFeatures() {
    budgetData = JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY)) || { monthly: 0, currency: 'USD' };
    expenses = JSON.parse(localStorage.getItem(EXPENSES_STORAGE_KEY)) || [];
    achievements = JSON.parse(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)) || { points: 0, level: 'Beginner', badges: [] };
    
    loadAnalyticsDashboard();
    loadBudgetTracker();
    loadAchievements();
}

// ============================================
// FEATURE 1: TRAVEL ANALYTICS DASHBOARD
// ============================================

function loadAnalyticsDashboard() {
    updateAnalyticsData();
    initializeCharts();
}

function updateAnalyticsData() {
    // Calculate total trips (both tour and custom bookings)
    const totalTrips = tourBookings.length + managedBookings.length;
    
    // Calculate total spent from both tour and custom bookings
    const tourSpent = tourBookings.reduce((sum, tour) => {
        let price = 0;
        if (typeof tour.priceNum !== 'undefined') {
            price = tour.priceNum;
        } else if (typeof tour.price === 'string') {
            price = parseFloat(tour.price.replace('$', '')) || 0;
        } else if (typeof tour.price === 'number') {
            price = tour.price;
        }
        return sum + price;
    }, 0);
    
    const customSpent = managedBookings.reduce((sum, booking) => {
        let price = 0;
        if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        return sum + price;
    }, 0);
    
    const totalSpent = tourSpent + customSpent;
    
    // Calculate countries visited from actual bookings
    const uniqueCountries = new Set([
        ...tourBookings.map(t => t.destination || 'Unknown'),
        ...managedBookings.map(b => b.destination || 'Unknown')
    ]);
    const countriesVisited = uniqueCountries.size;
    
    // Calculate days traveled from actual bookings
    const daysTraveled = [...tourBookings, ...managedBookings].reduce((sum, booking) => {
        return sum + (parseInt(booking.duration) || 1);
    }, 0);
    
    document.getElementById('totalTripsAnalytics').textContent = totalTrips;
    document.getElementById('totalSpentAnalytics').textContent = '$' + totalSpent.toFixed(2);
    document.getElementById('countriesVisited').textContent = countriesVisited;
    document.getElementById('daysTraveled').textContent = daysTraveled;
}

function initializeCharts() {
    // Calculate country visit counts and spending by country
    const countryData = {};
    
    [...tourBookings, ...managedBookings].forEach(booking => {
        const country = booking.destination || 'Unknown';
        if (!countryData[country]) {
            countryData[country] = { count: 0, spent: 0 };
        }
        countryData[country].count++;
        
        let price = 0;
        if (typeof booking.priceNum !== 'undefined') {
            price = booking.priceNum;
        } else if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        countryData[country].spent += price;
    });
    
    const countries = Object.keys(countryData);
    const visitCounts = countries.map(c => countryData[c].count);
    const spendingAmounts = countries.map(c => countryData[c].spent);
    
    // Most Visited Countries Chart
    const spendingCtx = document.getElementById('spendingChart');
    if (spendingCtx && typeof Chart !== 'undefined') {
        if (spendingChart) spendingChart.destroy();
        spendingChart = new Chart(spendingCtx, {
            type: 'doughnut',
            data: {
                labels: countries.length > 0 ? countries : ['No Data'],
                datasets: [{
                    data: visitCounts.length > 0 ? visitCounts : [1],
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
                        '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' visit' + (context.parsed > 1 ? 's' : '');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Spending by Country Chart - BAR CHART
    const countrySpendingCtx = document.getElementById('countrySpendingChart');
    if (countrySpendingCtx && typeof Chart !== 'undefined') {
        if (countrySpendingChart) countrySpendingChart.destroy();
        countrySpendingChart = new Chart(countrySpendingCtx, {
            type: 'bar',
            data: {
                labels: countries.length > 0 ? countries : ['No Data'],
                datasets: [{
                    label: 'Spending ($)',
                    data: spendingAmounts.length > 0 ? spendingAmounts : [0],
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
                        '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5'
                    ],
                    borderColor: [
                        '#FF5252', '#4ECDC4', '#FFD700', '#7FD8BE', '#FF6B9D',
                        '#9370DB', '#FFB6D9', '#7FFFD4', '#FFB366', '#FF9999'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    tension: 0.4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.x.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Monthly Spending Trend - Interactive Area Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx && typeof Chart !== 'undefined') {
        if (trendChart) trendChart.destroy();
        
        // Calculate spending by month
        const monthlySpending = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize all months with 0
        months.forEach(month => {
            monthlySpending[month] = 0;
        });
        
        // Add actual bookings to their respective months
        [...tourBookings, ...managedBookings].forEach(booking => {
            const bookingDate = new Date(booking.bookingDate || booking.createdDate || new Date());
            const monthIndex = bookingDate.getMonth();
            const monthName = months[monthIndex];
            
            let price = 0;
            if (typeof booking.priceNum !== 'undefined') {
                price = booking.priceNum;
            } else if (typeof booking.price === 'string') {
                price = parseFloat(booking.price.replace('$', '').replace(/,/g, '')) || 0;
            } else if (typeof booking.price === 'number') {
                price = booking.price;
            }
            
            monthlySpending[monthName] += price;
        });
        
        const monthlyData = months.map(month => monthlySpending[month]);
        
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Spending ($)',
                    data: monthlyData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#1976D2',
                    borderCapStyle: 'round'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 13 },
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return 'Spending: $' + context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            },
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
}

// ============================================
// FEATURE 2: SMART BUDGET TRACKER
// ============================================

function loadBudgetTracker() {
    updateBudgetDisplay();
    generateAlerts();
    updateExpenseBreakdown();
}

document.addEventListener('DOMContentLoaded', function() {
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateBudgetData();
        });
    }
});

function updateBudgetData() {
    const monthlyBudget = document.getElementById('monthlyBudget').value;
    const currency = document.getElementById('budgetCurrency').value;
    
    if (!monthlyBudget) {
        alert('Please enter a budget amount');
        return;
    }
    
    budgetData = { monthly: parseFloat(monthlyBudget), currency: currency };
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetData));
    updateBudgetDisplay();
    alert('Budget updated successfully!');
}

function updateBudgetDisplay() {
    // Calculate total spent from both tour and custom bookings
    const tourSpent = tourBookings.reduce((sum, tour) => {
        let price = 0;
        if (typeof tour.priceNum !== 'undefined') {
            price = tour.priceNum;
        } else if (typeof tour.price === 'string') {
            price = parseFloat(tour.price.replace('$', '')) || 0;
        } else if (typeof tour.price === 'number') {
            price = tour.price;
        }
        return sum + price;
    }, 0);
    
    const customSpent = managedBookings.reduce((sum, booking) => {
        let price = 0;
        if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        return sum + price;
    }, 0);
    
    const totalSpent = tourSpent + customSpent;
    const budget = budgetData.monthly;
    const remaining = budget - totalSpent;
    const percentage = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
    
    document.getElementById('budgetSpent').textContent = '$' + totalSpent.toFixed(2);
    document.getElementById('budgetRemaining').textContent = '$' + Math.max(0, remaining).toFixed(2);
    document.getElementById('budgetPercentage').textContent = percentage + '%';
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = Math.min(percentage, 100) + '%';
    progressFill.classList.remove('warning', 'danger');
    
    if (percentage >= 80) {
        progressFill.classList.add('danger');
    } else if (percentage >= 60) {
        progressFill.classList.add('warning');
    }
}

function generateAlerts() {
    const alertsContainer = document.getElementById('budgetAlerts');
    
    // Calculate total spent from both tour and custom bookings
    const tourSpent = tourBookings.reduce((sum, tour) => {
        let price = 0;
        if (typeof tour.priceNum !== 'undefined') {
            price = tour.priceNum;
        } else if (typeof tour.price === 'string') {
            price = parseFloat(tour.price.replace('$', '')) || 0;
        } else if (typeof tour.price === 'number') {
            price = tour.price;
        }
        return sum + price;
    }, 0);
    
    const customSpent = managedBookings.reduce((sum, booking) => {
        let price = 0;
        if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        return sum + price;
    }, 0);
    
    const totalSpent = tourSpent + customSpent;
    const budget = budgetData.monthly;
    const percentage = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
    
    let alertsHTML = '';
    
    if (budget === 0) {
        alertsHTML = `<div class="alert-item warning">
            <span class="alert-icon">⚠️</span>
            <span>Set a monthly budget to get smart spending alerts</span>
        </div>`;
    } else if (percentage >= 90) {
        alertsHTML = `<div class="alert-item danger">
            <span class="alert-icon">🚨</span>
            <span>CRITICAL: You've reached 90%+ of your budget! Consider reducing spending.</span>
        </div>`;
    } else if (percentage >= 75) {
        alertsHTML = `<div class="alert-item warning">
            <span class="alert-icon">⚠️</span>
            <span>WARNING: You're at ${percentage}% of your budget. Budget carefully for remaining trips.</span>
        </div>`;
    } else if (percentage >= 50) {
        alertsHTML = `<div class="alert-item warning">
            <span class="alert-icon">📊</span>
            <span>You've spent ${percentage}% of your monthly budget. ${Math.round(100 - percentage)}% remaining.</span>
        </div>`;
    } else {
        alertsHTML = `<div class="alert-item success">
            <span class="alert-icon">✅</span>
            <span>Great! You've only spent ${percentage}% of your budget. Keep up the smart spending!</span>
        </div>`;
    }
    
    alertsHTML += `<div class="alert-item success">
        <span class="alert-icon">💡</span>
        <span>Tip: Set category limits for Tours, Hotels, Dining, and Activities for better control.</span>
    </div>`;
    
    alertsContainer.innerHTML = alertsHTML;
}

function updateExpenseBreakdown() {
    // Calculate country spending and visit data
    const countryData = {};
    
    [...tourBookings, ...managedBookings].forEach(booking => {
        const country = booking.destination || 'Unknown';
        if (!countryData[country]) {
            countryData[country] = { count: 0, spent: 0 };
        }
        countryData[country].count++;
        
        let price = 0;
        if (typeof booking.priceNum !== 'undefined') {
            price = booking.priceNum;
        } else if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        countryData[country].spent += price;
    });
    
    // Sort by spending amount
    const sortedCountries = Object.entries(countryData)
        .sort((a, b) => b[1].spent - a[1].spent)
        .slice(0, 6);
    
    const countrySpendingList = document.getElementById('countrySpendingList');
    if (countrySpendingList) {
        if (sortedCountries.length === 0) {
            countrySpendingList.innerHTML = '<p class="no-data">No country spending data yet. Book a tour to see analytics!</p>';
        } else {
            countrySpendingList.innerHTML = sortedCountries.map(([country, data]) => `
                <div class="expense-item">
                    <div class="expense-item-details">
                        <span class="expense-category">🌍 ${country}</span>
                        <span class="expense-count">${data.count} booking${data.count > 1 ? 's' : ''}</span>
                    </div>
                    <span class="expense-amount">$${data.spent.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }
    
    // Update countries visited list for first chart
    const countriesList = document.getElementById('countriesList');
    if (countriesList) {
        const sortedByVisits = Object.entries(countryData)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 6);
        
        if (sortedByVisits.length === 0) {
            countriesList.innerHTML = '<p class="no-data">No destinations yet. Explore and book tours!</p>';
        } else {
            countriesList.innerHTML = sortedByVisits.map(([country, data]) => `
                <div class="expense-item">
                    <div class="expense-item-details">
                        <span class="expense-category">📍 ${country}</span>
                        <span class="expense-count">${data.count} visit${data.count > 1 ? 's' : ''}</span>
                    </div>
                    <span class="expense-amount">${data.count}</span>
                </div>
            `).join('');
        }
    }
}

// ============================================
// FEATURE 3: ACHIEVEMENTS & GAMIFICATION
// ============================================

const badgesDefinition = [
    { id: 1, name: 'Tour Starter', emoji: '🎫', description: 'Book 1 tour', condition: 'tours >= 1' },
    { id: 2, name: 'Tour Master', emoji: '✈️', description: 'Book 5 tours', condition: 'tours >= 5' },
    { id: 3, name: 'Tour Legend', emoji: '🏆', description: 'Book 10 tours', condition: 'tours >= 10' },
    { id: 4, name: 'Big Spender', emoji: '💰', description: 'Spend $1000+', condition: 'spent >= 1000' },
    { id: 5, name: 'World Explorer', emoji: '🌍', description: 'Visit 3+ countries', condition: 'countries >= 3' },
    { id: 6, name: 'Reviewer', emoji: '✍️', description: 'Write 5 reviews', condition: 'reviews >= 5' },
    { id: 7, name: 'Travel Enthusiast', emoji: '🎒', description: 'Plan 3 trips', condition: 'trips >= 3' },
    { id: 8, name: 'Adventure Seeker', emoji: '🧗', description: 'Book adventure tours', condition: 'adventure >= 2' }
];

function loadAchievements() {
    updateAchievementsProgress();
    displayBadges();
}

function updateAchievementsProgress() {
    // Count total bookings from both arrays
    const totalBookings = tourBookings.length + managedBookings.length;
    
    // Calculate total spent from both arrays with proper price parsing
    const tourSpent = tourBookings.reduce((sum, tour) => {
        let price = 0;
        if (typeof tour.priceNum !== 'undefined') {
            price = tour.priceNum;
        } else if (typeof tour.price === 'string') {
            price = parseFloat(tour.price.replace('$', '')) || 0;
        } else if (typeof tour.price === 'number') {
            price = tour.price;
        }
        return sum + price;
    }, 0);
    
    const customSpent = managedBookings.reduce((sum, booking) => {
        let price = 0;
        if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        return sum + price;
    }, 0);
    
    const spent = tourSpent + customSpent;
    const countries = new Set([
        ...tourBookings.map(t => t.destination || 'Unknown'),
        ...managedBookings.map(b => b.destination || 'Unknown')
    ]).size;
    const reviews = 0;
    
    // Calculate percentages
    const toursPercent = Math.min((totalBookings / 10) * 100, 100);
    const spendingPercent = Math.min((spent / 10000) * 100, 100);
    const countriesPercent = Math.min((countries / 5) * 100, 100);
    const reviewsPercent = Math.min((reviews / 5) * 100, 100);
    
    // Update UI
    document.getElementById('toursProgressNum').textContent = totalBookings;
    document.getElementById('spendingProgressNum').textContent = '$' + spent.toFixed(0);
    document.getElementById('countriesProgressNum').textContent = countries;
    document.getElementById('reviewsProgressNum').textContent = reviews;
    
    // Update SVG circles
    updateProgressCircle('toursProgressCircle', toursPercent);
    updateProgressCircle('spendingProgressCircle', spendingPercent);
    updateProgressCircle('countriesProgressCircle', countriesPercent);
    updateProgressCircle('reviewsProgressCircle', reviewsPercent);
    
    // Update achievement level
    const totalPoints = Math.round(toursPercent * 0.25 + spendingPercent * 0.25 + countriesPercent * 0.25 + reviewsPercent * 0.25);
    updateAchievementLevel(totalPoints);
}

function updateProgressCircle(elementId, percentage) {
    const circle = document.querySelector(`#${elementId}`);
    if (circle) {
        const offset = 283 - (283 * percentage / 100);
        circle.style.strokeDashoffset = offset;
    }
}

function updateAchievementLevel(points) {
    let level = 'Beginner';
    if (points >= 75) level = 'Legend';
    else if (points >= 50) level = 'Expert';
    else if (points >= 25) level = 'Intermediate';
    
    document.getElementById('achievementLevel').textContent = level;
    document.getElementById('totalPoints').textContent = Math.round(points);
}

function displayBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    const totalTours = tourBookings.length + managedBookings.length;
    
    // Calculate total spent from both arrays
    const tourSpent = tourBookings.reduce((sum, tour) => {
        let price = 0;
        if (typeof tour.priceNum !== 'undefined') {
            price = tour.priceNum;
        } else if (typeof tour.price === 'string') {
            price = parseFloat(tour.price.replace('$', '')) || 0;
        } else if (typeof tour.price === 'number') {
            price = tour.price;
        }
        return sum + price;
    }, 0);
    
    const customSpent = managedBookings.reduce((sum, booking) => {
        let price = 0;
        if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        return sum + price;
    }, 0);
    
    const spent = tourSpent + customSpent;
    const countries = new Set([
        ...tourBookings.map(t => t.destination || 'Unknown'),
        ...managedBookings.map(b => b.destination || 'Unknown')
    ]).size;
    const reviews = 0;
    
    const unlockedBadges = badgesDefinition.filter(badge => {
        if (badge.condition === 'tours >= 1') return totalTours >= 1;
        if (badge.condition === 'tours >= 5') return totalTours >= 5;
        if (badge.condition === 'tours >= 10') return totalTours >= 10;
        if (badge.condition === 'spent >= 1000') return spent >= 1000;
        if (badge.condition === 'countries >= 3') return countries >= 3;
        if (badge.condition === 'reviews >= 5') return reviews >= 5;
        if (badge.condition === 'trips >= 3') return totalTours >= 3;
        if (badge.condition === 'adventure >= 2') return totalTours >= 2;
        return false;
    });
    
    badgesGrid.innerHTML = badgesDefinition.map(badge => `
        <div class="badge-item ${unlockedBadges.find(b => b.id === badge.id) ? 'unlocked' : ''}">
            <div class="badge-icon">${badge.emoji}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">${badge.description}</div>
        </div>
    `).join('');
    
    document.getElementById('badgesCount').textContent = unlockedBadges.length;
    
    if (unlockedBadges.length === 0) {
        document.getElementById('noBadgesMsg').style.display = 'block';
    } else {
        document.getElementById('noBadgesMsg').style.display = 'none';
    }
}
