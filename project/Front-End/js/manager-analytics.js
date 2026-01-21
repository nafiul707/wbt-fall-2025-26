// Manager Analytics Features
// ============================================
// FEATURE 1: REVENUE ANALYTICS
// FEATURE 2: BOOKING STATUS OVERVIEW
// FEATURE 3: TOURIST GROWTH & INSIGHTS
// ============================================

let revenueChart = null;
let bookingStatusChart = null;
let touristGrowthChart = null;
let locationChart = null;

// Initialize manager analytics
function initializeManagerAnalytics() {
    loadRevenueAnalytics();
    loadBookingStatus();
    loadTouristInsights();
}

// ============================================
// FEATURE 1: REVENUE ANALYTICS DASHBOARD
// ============================================

function loadRevenueAnalytics() {
    updateRevenueStats();
    initializeRevenueCharts();
}

function updateRevenueStats() {
    // Get all users (tourists and bookings data)
    const users = JSON.parse(localStorage.getItem('myTravelUsers')) || [];
    const tourists = users.filter(u => u.role === 'tourist');
    
    // Calculate total bookings and revenue
    let totalBookings = 0;
    let totalRevenue = 0;
    const tourRevenue = {};

    // Sample tours data (same as in tourist dashboard)
    const sampleTours = [
        { id: 1, name: 'Paris City Tour', priceNum: 1200 },
        { id: 2, name: 'Tokyo Adventure', priceNum: 1500 },
        { id: 3, name: 'New York Explorer', priceNum: 1000 },
        { id: 4, name: 'Dubai Luxury', priceNum: 1800 },
        { id: 5, name: 'Barcelona Beach', priceNum: 1100 },
        { id: 6, name: 'Caribbean Cruise', priceNum: 2000 }
    ];

    tourists.forEach(tourist => {
        // Get both tour bookings AND custom/managed bookings
        const tourBookingsStr = localStorage.getItem('touristTourBookings');
        const managedBookingsStr = localStorage.getItem('touristManagedBookings');
        
        const tourBookings = tourBookingsStr ? JSON.parse(tourBookingsStr) : [];
        const managedBookings = managedBookingsStr ? JSON.parse(managedBookingsStr) : [];
        
        // Combine both booking arrays
        const allBookings = [
            ...tourBookings.filter(b => b.touristEmail === tourist.email),
            ...managedBookings.filter(b => b.touristEmail === tourist.email)
        ];
        
        allBookings.forEach(booking => {
            totalBookings++;
            
            let price = 0;
            if (typeof booking.priceNum !== 'undefined') {
                price = booking.priceNum;
            } else if (typeof booking.price === 'string') {
                price = parseFloat(booking.price.replace('$', '').replace(/,/g, '')) || 0;
            } else if (typeof booking.price === 'number') {
                price = booking.price;
            }
            
            totalRevenue += price;
            
            // Track revenue by tour
            const tourName = booking.tourName || 'Custom Booking';
            if (!tourRevenue[tourName]) {
                tourRevenue[tourName] = { count: 0, revenue: 0 };
            }
            tourRevenue[tourName].count++;
            tourRevenue[tourName].revenue += price;
        });
    });

    // Find top tour
    let topTourName = '-';
    let topTourRevenue = 0;
    for (let tour in tourRevenue) {
        if (tourRevenue[tour].revenue > topTourRevenue) {
            topTourRevenue = tourRevenue[tour].revenue;
            topTourName = tour;
        }
    }

    // Update display
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('topTour').textContent = topTourName.split(' ').slice(0, 2).join(' ');
    document.getElementById('activeTourists').textContent = tourists.length;

    // Display top tours
    displayTopTours(tourRevenue);
    
    return { totalBookings, totalRevenue, tourRevenue };
}

function displayTopTours(tourRevenue) {
    const topToursDiv = document.getElementById('topToursListManager');
    
    const sorted = Object.entries(tourRevenue)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5);

    if (sorted.length === 0) {
        topToursDiv.innerHTML = '<p class="no-data">No tour bookings yet.</p>';
        return;
    }

    topToursDiv.innerHTML = sorted.map(([tour, data]) => `
        <div class="tour-revenue-item">
            <div class="tour-info">
                <span class="tour-name">🎫 ${tour}</span>
                <span class="tour-bookings">${data.count} bookings</span>
            </div>
            <span class="tour-revenue">$${data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
    `).join('');
}

function initializeRevenueCharts() {
    const { totalBookings, totalRevenue, tourRevenue } = updateRevenueStats();
    
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && typeof Chart !== 'undefined') {
        if (revenueChart) revenueChart.destroy();
        
        const tourNames = Object.keys(tourRevenue).sort((a, b) => tourRevenue[b].revenue - tourRevenue[a].revenue);
        const revenues = tourNames.map(t => tourRevenue[t].revenue);
        
        revenueChart = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: tourNames.length > 0 ? tourNames : ['No Data'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenues.length > 0 ? revenues : [0],
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
                        '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5'
                    ],
                    borderColor: [
                        '#FF5252', '#4ECDC4', '#FFD700', '#7FD8BE', '#FF6B9D',
                        '#AA96DA', '#FFB6D9', '#7FFFD4', '#FFB366', '#FF9999'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
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
                                return '$' + context.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
}

// ============================================
// FEATURE 2: BOOKING STATUS OVERVIEW
// ============================================

function loadBookingStatus() {
    updateBookingStatusStats();
    initializeBookingStatusChart();
    displayRecentBookings();
}

function updateBookingStatusStats() {
    const users = JSON.parse(localStorage.getItem('myTravelUsers')) || [];
    const tourists = users.filter(u => u.role === 'tourist');
    
    let confirmed = 0, pending = 0, cancelled = 0;
    let recentBookings = [];

    tourists.forEach(tourist => {
        // Get both tour bookings AND custom/managed bookings
        const tourBookingsStr = localStorage.getItem('touristTourBookings');
        const managedBookingsStr = localStorage.getItem('touristManagedBookings');
        
        const tourBookings = tourBookingsStr ? JSON.parse(tourBookingsStr) : [];
        const managedBookings = managedBookingsStr ? JSON.parse(managedBookingsStr) : [];
        
        // Combine both booking arrays
        const allBookings = [
            ...tourBookings.filter(b => b.touristEmail === tourist.email),
            ...managedBookings.filter(b => b.touristEmail === tourist.email)
        ];
        
        allBookings.forEach(booking => {
            if (booking.status === 'Confirmed') confirmed++;
            else if (booking.status === 'Pending') pending++;
            else if (booking.status === 'Cancelled') cancelled++;
            
            recentBookings.push({
                ...booking,
                touristName: tourist.fullname
            });
        });
    });

    const total = confirmed + pending + cancelled;
    
    document.getElementById('confirmedCount').textContent = confirmed;
    document.getElementById('confirmedPercent').textContent = total > 0 ? Math.round((confirmed / total) * 100) + '%' : '0%';
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('pendingPercent').textContent = total > 0 ? Math.round((pending / total) * 100) + '%' : '0%';
    
    document.getElementById('cancelledCount').textContent = cancelled;
    document.getElementById('cancelledPercent').textContent = total > 0 ? Math.round((cancelled / total) * 100) + '%' : '0%';

    return { confirmed, pending, cancelled, total, recentBookings };
}

function displayRecentBookings() {
    const { recentBookings } = updateBookingStatusStats();
    const tbody = document.getElementById('recentBookingsBody');
    
    // Sort by booking date - handle both formats (bookingDate and createdDate)
    const sorted = recentBookings.sort((a, b) => {
        const dateA = new Date(a.bookingDate || a.createdDate || 0);
        const dateB = new Date(b.bookingDate || b.createdDate || 0);
        return dateB - dateA;
    }).slice(0, 10);

    tbody.innerHTML = sorted.map(booking => {
        // Get tour name - handle both formats (tourName for tour bookings, place for custom bookings)
        const tourName = booking.tourName || booking.place || 'Custom Booking';
        
        // Get booking date - handle both formats (bookingDate for tour bookings, bookDate/createdDate for custom)
        const bookingDateStr = booking.bookingDate || booking.bookDate || booking.createdDate;
        const bookingDate = bookingDateStr ? new Date(bookingDateStr).toLocaleDateString() : 'N/A';
        
        // Get price
        const price = booking.priceNum || parseFloat((booking.price || '0').toString().replace('$', '')) || 0;
        
        return `
            <tr>
                <td>${booking.touristName || 'Unknown'}</td>
                <td>${tourName}</td>
                <td>${bookingDate}</td>
                <td>$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td><span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span></td>
            </tr>
        `;
    }).join('');
}

function initializeBookingStatusChart() {
    const { confirmed, pending, cancelled, total } = updateBookingStatusStats();
    
    const ctx = document.getElementById('bookingStatusChart');
    if (ctx && typeof Chart !== 'undefined') {
        if (bookingStatusChart) bookingStatusChart.destroy();
        
        bookingStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Cancelled'],
                datasets: [{
                    data: [confirmed, pending, cancelled],
                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                    borderColor: ['#45a049', '#FFB300', '#DA190B'],
                    borderWidth: 2
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
                                const label = context.label || '';
                                const value = context.parsed;
                                const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                                return label + ': ' + value + ' (' + percent + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

// ============================================
// FEATURE 3: TOURIST GROWTH & INSIGHTS
// ============================================

function loadTouristInsights() {
    updateTouristStats();
    initializeTouristGrowthCharts();
}

function updateTouristStats() {
    const users = JSON.parse(localStorage.getItem('myTravelUsers')) || [];
    const tourists = users.filter(u => u.role === 'tourist');
    
    const currentMonth = new Date().getMonth();
    const newTouristsThisMonth = tourists.filter(t => {
        const regDate = new Date(t.startdate);
        return regDate.getMonth() === currentMonth;
    }).length;

    // Calculate repeat customers
    let repeatCount = 0;
    let totalSpent = 0;
    
    // Get both tour bookings AND custom/managed bookings
    const tourBookingsStr = localStorage.getItem('touristTourBookings');
    const managedBookingsStr = localStorage.getItem('touristManagedBookings');
    
    const tourBookings = tourBookingsStr ? JSON.parse(tourBookingsStr) : [];
    const managedBookings = managedBookingsStr ? JSON.parse(managedBookingsStr) : [];
    
    // Combine both booking arrays
    const allBookings = [...tourBookings, ...managedBookings];

    const touristBookingCounts = {};
    allBookings.forEach(booking => {
        if (!touristBookingCounts[booking.touristEmail]) {
            touristBookingCounts[booking.touristEmail] = { count: 0, spent: 0 };
        }
        touristBookingCounts[booking.touristEmail].count++;
        
        let price = booking.priceNum || parseFloat(booking.price.replace('$', '').replace(/,/g, '')) || 0;
        touristBookingCounts[booking.touristEmail].spent += price;
        totalSpent += price;
    });

    repeatCount = Object.values(touristBookingCounts).filter(t => t.count > 1).length;
    const repeatRate = tourists.length > 0 ? Math.round((repeatCount / tourists.length) * 100) : 0;
    const avgSpend = tourists.length > 0 ? totalSpent / tourists.length : 0;

    document.getElementById('totalTourists').textContent = tourists.length;
    document.getElementById('newTourists').textContent = newTouristsThisMonth;
    document.getElementById('repeatRate').textContent = repeatRate + '%';
    document.getElementById('avgSpend').textContent = '$' + avgSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Display preferences
    displayPreferences();

    return { tourists, touristBookingCounts };
}

function displayPreferences() {
    const users = JSON.parse(localStorage.getItem('myTravelUsers')) || [];
    const tourists = users.filter(u => u.role === 'tourist');
    
    const interests = {};
    tourists.forEach(t => {
        if (t.interests && Array.isArray(t.interests)) {
            t.interests.forEach(interest => {
                interests[interest] = (interests[interest] || 0) + 1;
            });
        }
    });

    const sorted = Object.entries(interests).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const prefsDiv = document.getElementById('preferencesListManager');

    if (sorted.length === 0) {
        prefsDiv.innerHTML = '<p class="no-data">No preference data yet.</p>';
        return;
    }

    prefsDiv.innerHTML = sorted.map(([interest, count]) => `
        <div class="preference-item">
            <span class="preference-name">❤️ ${interest}</span>
            <span class="preference-count">${count} tourists</span>
        </div>
    `).join('');
}

function initializeTouristGrowthCharts() {
    const { tourists } = updateTouristStats();
    
    // Tourist Growth Chart
    const growthCtx = document.getElementById('touristGrowthChart');
    if (growthCtx && typeof Chart !== 'undefined') {
        if (touristGrowthChart) touristGrowthChart.destroy();
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyTourists = {};
        
        months.forEach(m => {
            monthlyTourists[m] = 0;
        });
        
        tourists.forEach(t => {
            const date = new Date(t.startdate);
            const month = months[date.getMonth()];
            monthlyTourists[month]++;
        });

        const monthData = months.map(m => monthlyTourists[m]);

        touristGrowthChart = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'New Tourists',
                    data: monthData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Location Distribution Chart
    const locationCtx = document.getElementById('locationChart');
    if (locationCtx && typeof Chart !== 'undefined') {
        if (locationChart) locationChart.destroy();
        
        const countries = {};
        tourists.forEach(t => {
            const country = t.country || 'Unknown';
            countries[country] = (countries[country] || 0) + 1;
        });

        const sorted = Object.entries(countries).sort((a, b) => b[1] - a[1]);
        const countryNames = sorted.map(c => c[0]);
        const countryData = sorted.map(c => c[1]);

        locationChart = new Chart(locationCtx, {
            type: 'doughnut',
            data: {
                labels: countryNames.length > 0 ? countryNames : ['No Data'],
                datasets: [{
                    data: countryData.length > 0 ? countryData : [1],
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
                        '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }
}
