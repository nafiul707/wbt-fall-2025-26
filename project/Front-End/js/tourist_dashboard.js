// Tourist Dashboard Script with Booking Management

let touristData = {};
let tourBookings = [];
let managedBookings = [];
let favorites = [];
let editingBookingId = null;
let editingBookingType = null;
const TOUR_BOOKINGS_STORAGE_KEY = 'touristTourBookings';
const MANAGED_BOOKINGS_STORAGE_KEY = 'touristManagedBookings';
const FAVORITES_STORAGE_KEY = 'touristFavorites';

// Sample tours data
const sampleTours = [
    {
        id: 1,
        name: 'Paris City Tour',
        description: 'Explore the beauty of Paris',
        emoji: '🗼',
        price: '$1,200',
        priceNum: 1200,
        duration: '5 days'
    },
    {
        id: 2,
        name: 'Tokyo Adventure',
        description: 'Experience Japanese culture',
        emoji: '🗾',
        price: '$1,500',
        priceNum: 1500,
        duration: '6 days'
    },
    {
        id: 3,
        name: 'New York Explorer',
        description: 'Discover the city that never sleeps',
        emoji: '🗽',
        price: '$1,000',
        priceNum: 1000,
        duration: '4 days'
    },
    {
        id: 4,
        name: 'Dubai Luxury',
        description: 'Luxury experience in the desert',
        emoji: '🏜️',
        price: '$1,800',
        priceNum: 1800,
        duration: '5 days'
    },
    {
        id: 5,
        name: 'Swiss Alps Adventure',
        description: 'Mountain trekking and scenic views',
        emoji: '⛰️',
        price: '$1,600',
        priceNum: 1600,
        duration: '7 days'
    },
    {
        id: 6,
        name: 'Caribbean Cruise',
        description: 'Beach paradise and water activities',
        emoji: '🏖️',
        price: '$2,000',
        priceNum: 2000,
        duration: '8 days'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadTouristProfile();
    loadTourBookings();
    loadManagedBookings();
    loadFavorites();
    setupEventListeners();
    displayTours();
    displayManagerTours();
    displayFavoriteTours();
    updateStats();
    
    // Initialize new features
    initializeNewFeatures();
    
    // Add search event listener for real-time search
    const searchInput = document.getElementById('bookSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleBookingSearch);
    }
});

// Check if user is logged in
function checkSession() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        alert('Please sign in first');
        window.location.href = 'sign_in.html';
        return;
    }

    try {
        const sessionData = JSON.parse(session);
        
        // Check if user is a tourist
        if (sessionData.role !== 'tourist') {
            alert('Access denied. Only tourists can access this area.');
            window.location.href = 'dashboard.html';
            return;
        }

        touristData = sessionData;
        document.getElementById('userName').textContent = sessionData.fullname;
        document.getElementById('touristName').textContent = sessionData.fullname.split(' ')[0];
    } catch (error) {
        window.location.href = 'sign_in.html';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    document.getElementById('bookCancelBtn').addEventListener('click', resetBookingForm);
    document.getElementById('bookSearchInput').addEventListener('keyup', handleBookingSearch);
}

// Logout functionality
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'sign_in.html';
    }
}

// Show/Hide sections
function showSection(event, sectionName) {
    event.preventDefault();
    
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    const sectionId = sectionName + '-section';
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    event.target.closest('.menu-item').classList.add('active');
}

// Logout function (alias)
function logout() {
    handleLogout();
}

// Load tourist profile
function loadTouristProfile() {
    const users = JSON.parse(localStorage.getItem('myTravelUsers')) || [];
    const user = users.find(u => u.email === touristData.email);

    if (user) {
        document.getElementById('profileFullName').textContent = user.fullname;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileCountry').textContent = user.country;
        document.getElementById('profileUserID').textContent = user.userid;
        document.getElementById('profileStartDate').textContent = user.startdate || 'Not set';
        document.getElementById('profileInterests').textContent = user.interests.length > 0 ? user.interests.join(', ') : 'None';
    }
}

// Load tour bookings (from available tours)
function loadTourBookings() {
    const storedBookings = localStorage.getItem(TOUR_BOOKINGS_STORAGE_KEY);
    if (storedBookings) {
        tourBookings = JSON.parse(storedBookings);
        tourBookings = tourBookings.filter(b => b.touristEmail === touristData.email);
    }
    displayTourBookings();
}

// Display tour bookings - now merged with managed bookings
function displayTourBookings() {
    // This now displays merged bookings
    displayAllBookings();
}

// Load managed bookings (confirmed places)
function loadManagedBookings() {
    const storedBookings = localStorage.getItem(MANAGED_BOOKINGS_STORAGE_KEY);
    if (storedBookings) {
        managedBookings = JSON.parse(storedBookings);
        managedBookings = managedBookings.filter(b => b.touristEmail === touristData.email);
    }
    displayAllBookings();
}

// Display managed bookings - now merged with tour bookings
function displayManagedBookings() {
    // This now displays merged bookings
    displayAllBookings();
}

// Display ALL bookings (merged tour + managed) in single table
function displayAllBookings() {
    const tableBody = document.getElementById('bookingsTableBody');
    const noBookings = document.getElementById('noBookingsManage');

    // Add type to tour bookings
    const allBookings = [
        ...tourBookings.map(b => ({ ...b, bookingType: 'tour' })),
        ...managedBookings.map(b => ({ ...b, bookingType: 'custom' }))
    ].sort((a, b) => new Date(b.createdDate || b.bookingDate) - new Date(a.createdDate || a.bookingDate));

    if (allBookings.length === 0) {
        tableBody.innerHTML = '';
        noBookings.style.display = 'block';
        noBookings.textContent = 'No bookings found. Book a tour or confirm a place!';
        return;
    }

    noBookings.style.display = 'none';
    tableBody.innerHTML = allBookings.map(booking => {
        const place = booking.bookingType === 'tour' ? booking.tourName : booking.place;
        const location = booking.bookingType === 'tour' ? booking.destination : booking.location;
        const checkIn = booking.bookingType === 'tour' ? booking.bookingDate : booking.checkIn;
        const checkOut = booking.bookingType === 'tour' ? booking.bookingDate : booking.checkOut;
        const typeLabel = booking.bookingType === 'tour' ? 'Tour' : 'Custom Place';
        
        // Get actual price value
        let priceValue = 0;
        if (booking.bookingType === 'tour') {
            // For tours, try to get from sampleTours first, then from booking
            const tourInfo = sampleTours.find(t => t.id === booking.tourId);
            priceValue = tourInfo?.priceNum || booking.priceNum || 0;
        } else {
            // For custom bookings, use stored priceNum or calculate from price string
            if (typeof booking.priceNum !== 'undefined') {
                priceValue = booking.priceNum;
            } else if (typeof booking.price === 'string') {
                priceValue = parseFloat(booking.price.replace('$', '').replace(/,/g, '')) || 0;
            } else if (typeof booking.price === 'number') {
                priceValue = booking.price;
            }
        }
        
        return `
            <tr>
                <td><strong>${place}</strong></td>
                <td>${location}</td>
                <td>${new Date(checkIn).toLocaleDateString()}</td>
                <td>${new Date(checkOut).toLocaleDateString()}</td>
                <td>$${priceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td><span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td><span class="type-badge ${booking.bookingType}">${typeLabel}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" data-id="${booking.id}" data-type="${booking.bookingType}">Edit</button>
                        <button class="btn btn-delete" data-id="${booking.id}" data-type="${booking.bookingType}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to buttons
    addBookingButtonListeners();
}

// Add event listeners to edit and delete buttons
function addBookingButtonListeners() {
    // Edit button listeners
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const bookingId = this.getAttribute('data-id');
            const bookingType = this.getAttribute('data-type');
            editBooking(bookingId, bookingType);
        });
    });
    
    // Delete button listeners
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const bookingId = this.getAttribute('data-id');
            const bookingType = this.getAttribute('data-type');
            deleteBooking(bookingId, bookingType);
        });
    });
}

// Handle booking form submission
function handleBookingSubmit(e) {
    e.preventDefault();
    console.log('Form submitted. editingBookingId:', editingBookingId);

    const place = document.getElementById('bookPlace').value.trim();
    const location = document.getElementById('bookLocation').value.trim();
    const bookDate = document.getElementById('bookDate').value;
    const checkIn = document.getElementById('bookCheckIn').value;
    const checkOut = document.getElementById('bookCheckOut').value;
    const price = document.getElementById('bookPrice').value;
    const status = document.getElementById('bookStatus').value;
    const notes = document.getElementById('bookNotes').value.trim();

    // Validation
    if (!place || !location || !bookDate || !checkIn || !checkOut || !price) {
        alert('Please fill all required fields');
        return;
    }

    if (price <= 0) {
        alert('Price must be greater than 0');
        return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
        alert('Check-out date must be after check-in date');
        return;
    }

    if (editingBookingId !== null) {
        // Update existing booking
        console.log('Updating booking with ID:', editingBookingId, 'Type:', editingBookingType);
        
        if (editingBookingType === 'tour') {
            // Update tour booking
            const booking = tourBookings.find(b => b.id == editingBookingId);
            console.log('Found tour booking to update:', booking);
            
            if (booking) {
                booking.tourName = place;
                booking.destination = location;
                booking.bookingDate = bookDate;
                booking.price = '$' + price;
                booking.status = status;
                booking.notes = notes;
                booking.updatedDate = new Date().toISOString();
                console.log('Updated tour booking:', booking);
                alert('Booking updated successfully!');
                saveTourBookings();
            } else {
                alert('Error: Could not find tour booking to update');
            }
        } else {
            // Update custom booking
            const booking = managedBookings.find(b => b.id == editingBookingId);
            console.log('Found custom booking to update:', booking);
            
            if (booking) {
                booking.place = place;
                booking.location = location;
                booking.bookDate = bookDate;
                booking.checkIn = checkIn;
                booking.checkOut = checkOut;
                booking.price = price;
                booking.priceNum = parseFloat(price) || 0;
                booking.status = status;
                booking.notes = notes;
                booking.updatedDate = new Date().toISOString();
                console.log('Updated custom booking:', booking);
                alert('Booking updated successfully!');
                saveManagedBookings();
            } else {
                alert('Error: Could not find custom booking to update');
            }
        }
        editingBookingId = null;
        editingBookingType = null;
    } else {
        // Create new booking
        console.log('Creating new booking');
        const newBooking = {
            id: generateBookingId(),
            place: place,
            location: location,
            bookDate: bookDate,
            checkIn: checkIn,
            checkOut: checkOut,
            price: price,
            priceNum: parseFloat(price) || 0,
            status: status,
            notes: notes,
            destination: location,
            duration: '1 day',
            touristEmail: touristData.email,
            touristName: touristData.fullname,
            createdDate: new Date().toISOString()
        };
        managedBookings.push(newBooking);
        console.log('New booking created:', newBooking);
        alert('Booking confirmed successfully!');
        saveManagedBookings();
        
        // 🔥 UPDATE DYNAMIC FEATURES
        if (typeof updateBudgetDisplay === 'function') updateBudgetDisplay();
        if (typeof generateAlerts === 'function') generateAlerts();
        if (typeof updateAnalyticsData === 'function') updateAnalyticsData();
        if (typeof initializeCharts === 'function') initializeCharts();
        if (typeof updateAchievementsProgress === 'function') updateAchievementsProgress();
        if (typeof displayBadges === 'function') displayBadges();
    }

    displayAllBookings();
    resetBookingForm();
}

// Edit booking
function editBooking(id, bookingType = 'custom') {
    console.log('Edit button clicked - ID:', id, 'Type:', bookingType);
    
    let booking = null;
    
    if (bookingType === 'tour') {
        booking = tourBookings.find(b => {
            console.log('Comparing tour booking ID:', b.id, 'with:', id, 'Result:', b.id == id);
            return b.id == id;
        });
        console.log('Found tour booking:', booking);
    } else {
        booking = managedBookings.find(b => {
            console.log('Comparing custom booking ID:', b.id, 'with:', id, 'Result:', b.id == id);
            return b.id == id;
        });
        console.log('Found custom booking:', booking);
    }
    
    if (booking) {
        editingBookingId = id;
        editingBookingType = bookingType;
        console.log('Setting editingBookingId to:', editingBookingId, 'Type:', editingBookingType);
        
        // Populate form fields
        const place = bookingType === 'tour' ? booking.tourName : booking.place;
        const location = bookingType === 'tour' ? booking.destination : booking.location;
        
        document.getElementById('bookPlace').value = place || '';
        document.getElementById('bookLocation').value = location || '';
        document.getElementById('bookDate').value = booking.bookDate || '';
        document.getElementById('bookCheckIn').value = booking.checkIn || booking.bookingDate || '';
        document.getElementById('bookCheckOut').value = booking.checkOut || booking.bookingDate || '';
        document.getElementById('bookPrice').value = booking.price.replace('$', '') || '';
        document.getElementById('bookStatus').value = booking.status || 'Confirmed';
        document.getElementById('bookNotes').value = booking.notes || '';

        // Change form title and button text
        document.getElementById('bookingFormTitle').textContent = 'Update Booking';
        document.getElementById('bookSubmitBtn').textContent = 'Update Booking';
        document.getElementById('bookCancelBtn').style.display = 'inline-block';

        console.log('Form populated, now showing bookings section');
        
        // Show bookings section
        showSection('bookings');

        // Scroll to form with a small delay
        setTimeout(() => {
            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth' });
                console.log('Scrolled to form');
            }
        }, 100);
    } else {
        console.error('Booking not found! ID:', id, 'Type:', bookingType);
        alert('Booking not found!');
    }
}

// Delete booking
function deleteBooking(id, bookingType = 'custom') {
    console.log('Delete requested for ID:', id, 'Type:', bookingType);
    
    if (confirm('Are you sure you want to delete this booking?')) {
        if (bookingType === 'tour') {
            console.log('Deleting tour booking. Before:', tourBookings.length);
            tourBookings = tourBookings.filter(b => b.id != id);
            console.log('After:', tourBookings.length);
            saveTourBookings();
        } else {
            console.log('Deleting custom booking. Before:', managedBookings.length);
            console.log('Managed bookings:', managedBookings);
            managedBookings = managedBookings.filter(b => {
                console.log('Checking ID:', b.id, 'against:', id, 'Result:', b.id != id);
                return b.id != id;
            });
            console.log('After:', managedBookings.length);
            saveManagedBookings();
        }
        displayAllBookings();
        
        // 🔥 UPDATE DYNAMIC FEATURES
        if (typeof updateBudgetDisplay === 'function') updateBudgetDisplay();
        if (typeof generateAlerts === 'function') generateAlerts();
        if (typeof updateAnalyticsData === 'function') updateAnalyticsData();
        if (typeof initializeCharts === 'function') initializeCharts();
        if (typeof updateAchievementsProgress === 'function') updateAchievementsProgress();
        if (typeof displayBadges === 'function') displayBadges();
        
        alert('Booking deleted successfully!');
    }
}

// Reset booking form
function resetBookingForm() {
    document.getElementById('bookingForm').reset();
    editingBookingId = null;
    editingBookingType = null;
    document.getElementById('bookingFormTitle').textContent = 'Confirm a New Booking';
    document.getElementById('bookSubmitBtn').textContent = 'Confirm Booking';
    document.getElementById('bookCancelBtn').style.display = 'none';
}

// Cancel edit mode
function cancelEdit() {
    resetBookingForm();
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Search bookings
function handleBookingSearch() {
    const searchTerm = document.getElementById('bookSearchInput').value.toLowerCase();
    const tableBody = document.getElementById('bookingsTableBody');
    const noBookings = document.getElementById('noBookingsManage');

    // Combine both booking types for search
    const allBookings = [
        ...tourBookings.map(b => ({ ...b, bookingType: 'tour' })),
        ...managedBookings.map(b => ({ ...b, bookingType: 'custom' }))
    ];

    const filteredBookings = allBookings.filter(booking => {
        const place = booking.bookingType === 'tour' ? booking.tourName : booking.place;
        const location = booking.bookingType === 'tour' ? booking.destination : booking.location;
        return place.toLowerCase().includes(searchTerm) || 
               location.toLowerCase().includes(searchTerm);
    }).sort((a, b) => new Date(b.createdDate || b.bookingDate) - new Date(a.createdDate || a.bookingDate));

    if (filteredBookings.length === 0) {
        tableBody.innerHTML = '';
        noBookings.textContent = 'No bookings found matching your search.';
        noBookings.style.display = 'block';
        return;
    }

    noBookings.style.display = 'none';
    tableBody.innerHTML = filteredBookings.map(booking => {
        const place = booking.bookingType === 'tour' ? booking.tourName : booking.place;
        const location = booking.bookingType === 'tour' ? booking.destination : booking.location;
        const checkIn = booking.bookingType === 'tour' ? booking.bookingDate : booking.checkIn;
        const checkOut = booking.bookingType === 'tour' ? booking.bookingDate : booking.checkOut;
        const typeLabel = booking.bookingType === 'tour' ? 'Tour' : 'Custom Place';
        
        // Handle price - could be string or number
        let priceDisplay = booking.price;
        if (typeof booking.price === 'string') {
            priceDisplay = booking.price.replace('$', '');
        }
        
        return `
            <tr>
                <td><strong>${place}</strong></td>
                <td>${location}</td>
                <td>${new Date(checkIn).toLocaleDateString()}</td>
                <td>${new Date(checkOut).toLocaleDateString()}</td>
                <td>$${parseFloat(priceDisplay).toFixed(2)}</td>
                <td><span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td><span class="type-badge ${booking.bookingType}">${typeLabel}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" data-id="${booking.id}" data-type="${booking.bookingType}">Edit</button>
                        <button class="btn btn-delete" data-id="${booking.id}" data-type="${booking.bookingType}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to buttons
    addBookingButtonListeners();
}

// Clear booking search
function clearBookingSearch() {
    document.getElementById('bookSearchInput').value = '';
    displayAllBookings();
}

// Save tour bookings to localStorage
function saveTourBookings() {
    localStorage.setItem(TOUR_BOOKINGS_STORAGE_KEY, JSON.stringify(tourBookings));
}

// Save managed bookings to localStorage
function saveManagedBookings() {
    localStorage.setItem(MANAGED_BOOKINGS_STORAGE_KEY, JSON.stringify(managedBookings));
}

// Generate unique booking ID
function generateBookingId() {
    return Math.max(0, ...managedBookings.map(b => b.id)) + 1;
}

// Display tours
function displayTours() {
    const featuredToursGrid = document.getElementById('featuredToursGrid');

    const tourHtml = sampleTours.map(tour => {
        const isFavorite = favorites.some(f => f.id === tour.id);
        return `
        <div class="tour-card">
            <div class="tour-image">${tour.emoji}</div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${tour.id}, '${tour.name}', '${tour.price}')" title="Add to favorites">
                ${isFavorite ? '⭐' : '☆'}
            </button>
            <div class="tour-content">
                <div class="tour-name">${tour.name}</div>
                <div class="tour-desc">${tour.description}</div>
                <div class="tour-footer">
                    <span class="tour-price">${tour.price}</span>
                    <button class="tour-btn" onclick="bookTour(${tour.id}, '${tour.name}', '${tour.price}', '${tour.duration}')">Book Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    if (featuredToursGrid) {
        featuredToursGrid.innerHTML = tourHtml;
    }
}

// Display manager-created tours
function displayManagerTours() {
    const managerToursGrid = document.getElementById('managerToursGrid');
    if (!managerToursGrid) return;
    
    const managerTours = JSON.parse(localStorage.getItem('managerCreatedTours')) || [];
    
    if (managerTours.length === 0) {
        managerToursGrid.innerHTML = '<p class="no-data">No tours available at the moment</p>';
        return;
    }
    
    const tourHtml = managerTours.map(tour => {
        const isFavorite = favorites.some(f => f.id === tour.id && f.source === 'manager');
        return `
        <div class="tour-card">
            <div class="tour-image">🎫</div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${tour.id}, '${tour.name}', '${tour.price}', 'manager')" title="Add to favorites">
                ${isFavorite ? '⭐' : '☆'}
            </button>
            <div class="tour-content">
                <div class="tour-name">${tour.name}</div>
                <div class="tour-location">📍 ${tour.location}</div>
                <div class="tour-desc">${tour.description}</div>
                <div class="tour-footer">
                    <span class="tour-price">$${parseFloat(tour.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <button class="tour-btn" onclick="bookManagerTour(${tour.id}, '${tour.name}', ${tour.price}, ${tour.duration})">Book Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    managerToursGrid.innerHTML = tourHtml;
}

// Book manager-created tour
function bookManagerTour(tourId, tourName, price, duration) {
    const managerTour = JSON.parse(localStorage.getItem('managerCreatedTours') || '[]').find(t => t.id === tourId);
    
    if (!managerTour) {
        alert('Tour not found!');
        return;
    }
    
    const booking = {
        id: 'BK' + Date.now(),
        tourId: tourId,
        tourName: tourName,
        price: `$${price}`,
        priceNum: parseFloat(price),
        duration: duration,
        destination: tourName,
        location: managerTour.location,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed',
        touristEmail: touristData.email,
        touristName: touristData.fullname,
        createdDate: new Date().toISOString(),
        source: 'manager'
    };

    tourBookings.push(booking);
    saveTourBookings();

    alert(`Booking confirmed!\n\nTour: ${tourName}\nPrice: $${price}\nDuration: ${duration} days\nBooking ID: ${booking.id}`);
    displayAllBookings();
    updateStats();
    
    // 🔥 UPDATE DYNAMIC FEATURES
    if (typeof updateBudgetDisplay === 'function') updateBudgetDisplay();
    if (typeof generateAlerts === 'function') generateAlerts();
    if (typeof updateAnalyticsData === 'function') updateAnalyticsData();
    if (typeof initializeCharts === 'function') initializeCharts();
    if (typeof updateAchievementsProgress === 'function') updateAchievementsProgress();
    if (typeof displayBadges === 'function') displayBadges();
}

// Book tour
function bookTour(tourId, tourName, price, duration) {
    const tourInfo = sampleTours.find(t => t.id === tourId);
    const booking = {
        id: 'BK' + Date.now(),
        tourId: tourId,
        tourName: tourName,
        price: price,
        priceNum: tourInfo?.priceNum || parseFloat(price.replace('$', '').replace(/,/g, '')) || 0,
        duration: duration,
        destination: tourInfo?.name || 'Tour Destination',
        bookingDate: new Date().toISOString(),
        status: 'Confirmed',
        touristEmail: touristData.email,
        touristName: touristData.fullname,
        createdDate: new Date().toISOString()
    };

    tourBookings.push(booking);
    saveTourBookings();

    alert(`Booking confirmed!\n\nTour: ${tourName}\nPrice: ${price}\nBooking ID: ${booking.id}`);
    displayAllBookings();
    updateStats();
    
    // 🔥 UPDATE DYNAMIC FEATURES
    if (typeof updateBudgetDisplay === 'function') updateBudgetDisplay();
    if (typeof generateAlerts === 'function') generateAlerts();
    if (typeof updateAnalyticsData === 'function') updateAnalyticsData();
    if (typeof initializeCharts === 'function') initializeCharts();
    if (typeof updateAchievementsProgress === 'function') updateAchievementsProgress();
    if (typeof displayBadges === 'function') displayBadges();
}

// Update stats
function updateStats() {
    document.getElementById('upcomingBookings').textContent = tourBookings.length;
    document.getElementById('completedTours').textContent = Math.floor(tourBookings.length * 0.5);
    const userFavorites = favorites.filter(f => f.touristEmail === touristData.email);
    document.getElementById('favoriteTours').textContent = userFavorites.length;
    
    // Calculate and update total spent
    const totalSpent = [...tourBookings, ...managedBookings].reduce((sum, booking) => {
        let price = 0;
        if (typeof booking.priceNum !== 'undefined') {
            price = booking.priceNum;
        } else if (typeof booking.price === 'string') {
            price = parseFloat(booking.price.replace('$', '').replace(/,/g, '')) || 0;
        } else if (typeof booking.price === 'number') {
            price = booking.price;
        }
        return sum + price;
    }, 0);
    
    document.getElementById('totalSpentDisplay').textContent = '$' + totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// ============================================
// NEW FEATURES: RECOMMENDATIONS, REVIEWS, TRIP PLANNER
// ============================================

// Storage keys for new features
const RECOMMENDATIONS_STORAGE_KEY = 'touristRecommendations';
const REVIEWS_STORAGE_KEY = 'touristReviews';
const TRIP_PLANS_STORAGE_KEY = 'touristTripPlans';

let reviews = [];
let tripPlans = [];
let currentRating = 0;

// Initialize new features
function initializeNewFeatures() {
    reviews = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || [];
    tripPlans = JSON.parse(localStorage.getItem(TRIP_PLANS_STORAGE_KEY)) || [];
    loadRecommendations();
    loadReviews();
    loadTripPlans();
}

// ============================================
// FEATURE 1: RECOMMENDATIONS
// ============================================

const recommendedTours = [
    {
        id: 101,
        name: 'Swiss Alps Adventure',
        category: 'adventure',
        description: 'Breathtaking mountain hiking and skiing',
        emoji: '⛰️',
        price: '$1,600',
        priceNum: 1600,
        duration: '7 days'
    },
    {
        id: 102,
        name: 'Venice Romance',
        category: 'cultural',
        description: 'Romantic gondola rides and historic landmarks',
        emoji: '🚤',
        price: '$1,300',
        priceNum: 1300,
        duration: '5 days'
    },
    {
        id: 103,
        name: 'Maldives Luxury Resort',
        category: 'luxury',
        description: 'All-inclusive luxury island escape',
        emoji: '🏝️',
        price: '$2,500',
        priceNum: 2500,
        duration: '10 days'
    },
    {
        id: 104,
        name: 'Rome Historical Tour',
        category: 'cultural',
        description: 'Ancient ruins, museums, and Renaissance art',
        emoji: '🏛️',
        price: '$1,100',
        priceNum: 1100,
        duration: '4 days'
    },
    {
        id: 105,
        name: 'Bali Adventure',
        category: 'adventure',
        description: 'Surfing, jungle trekking, and temples',
        emoji: '🏄',
        price: '$1,400',
        priceNum: 1400,
        duration: '6 days'
    },
    {
        id: 106,
        name: 'Dubai Shopping & Desert',
        category: 'luxury',
        description: 'Luxury shopping and desert safari',
        emoji: '🛍️',
        price: '$1,900',
        priceNum: 1900,
        duration: '5 days'
    }
];

function loadRecommendations() {
    displayRecommendations('all');
}

function filterRecommendations(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayRecommendations(category);
}

function displayRecommendations(category) {
    const grid = document.getElementById('recommendationsGrid');
    const noRec = document.getElementById('noRecommendations');
    
    let tours = category === 'all' ? recommendedTours : recommendedTours.filter(t => t.category === category);
    
    if (tours.length === 0) {
        grid.innerHTML = '';
        noRec.style.display = 'block';
        return;
    }
    
    grid.innerHTML = tours.map(tour => `
        <div class="recommendation-card">
            <div class="recommendation-header">
                <span class="recommendation-title">${tour.emoji} ${tour.name}</span>
                <span class="recommendation-badge">${tour.category}</span>
            </div>
            <p class="recommendation-description">${tour.description}</p>
            <div class="recommendation-meta">
                <div class="meta-item">⏱️ ${tour.duration}</div>
                <div class="meta-item">📍 Moderate</div>
            </div>
            <div class="recommendation-price">${tour.price}</div>
            <button class="recommendation-btn" onclick="bookRecommendation(${tour.id})">Book Now</button>
        </div>
    `).join('');
    noRec.style.display = 'none';
}

function bookRecommendation(tourId) {
    const tour = recommendedTours.find(t => t.id === tourId);
    alert(`Added "${tour.name}" to your bookings!\n\nPrice: ${tour.price}\n\nYou can view it in "Manage Tours" section.`);
}

// ============================================
// FEATURE 2: REVIEWS & RATINGS
// ============================================

function loadReviews() {
    updateReviewTourSelect();
    displayReviews();
}

function updateReviewTourSelect() {
    const select = document.getElementById('reviewTourSelect');
    const completedTours = tourBookings.filter((_, i) => i % 2 === 0);
    
    if (completedTours.length > 0) {
        select.innerHTML = '<option value="">-- Choose a tour you\'ve completed --</option>';
        completedTours.forEach(tour => {
            const option = document.createElement('option');
            option.value = tour.id;
            option.textContent = tour.name;
            select.appendChild(option);
        });
    }
}

function setRating(rating) {
    currentRating = rating;
    document.getElementById('reviewRating').value = rating;
    
    // Update star display
    document.querySelectorAll('.star').forEach((star, i) => {
        if (i < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addReview();
        });
    }
});

function addReview() {
    const tourSelect = document.getElementById('reviewTourSelect');
    const tourName = tourSelect.options[tourSelect.selectedIndex].text;
    const rating = currentRating;
    const comment = document.getElementById('reviewComment').value;
    
    if (!tourName || tourName === "-- Choose a tour you've completed --" || rating === 0 || !comment) {
        alert('Please fill all fields and select a rating');
        return;
    }
    
    const review = {
        id: Date.now(),
        tourName: tourName,
        rating: rating,
        comment: comment,
        author: touristData.user_name || 'Anonymous',
        date: new Date().toLocaleDateString()
    };
    
    reviews.push(review);
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    
    document.getElementById('reviewForm').reset();
    currentRating = 0;
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    
    displayReviews();
    alert('Review posted successfully!');
}

function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const noReviews = document.getElementById('noReviews');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '';
        noReviews.style.display = 'block';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-tour-name">${review.tourName}</span>
                <div>
                    <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                    <span class="review-date">${review.date}</span>
                </div>
            </div>
            <p class="review-text">"${review.comment}"</p>
            <p class="review-author">— ${review.author}</p>
        </div>
    `).join('');
    noReviews.style.display = 'none';
}

// ============================================
// FEATURE 3: TRIP PLANNER
// ============================================

function loadTripPlans() {
    displayTripPlans();
}

document.addEventListener('DOMContentLoaded', function() {
    const tripForm = document.getElementById('tripPlannerForm');
    if (tripForm) {
        tripForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTripPlan();
        });
    }
});

function addTripPlan() {
    const tripName = document.getElementById('tripName').value;
    const duration = document.getElementById('tripDuration').value;
    const budget = document.getElementById('tripBudget').value;
    const startDate = document.getElementById('tripStartDate').value;
    const description = document.getElementById('tripDescription').value;
    const tripType = document.getElementById('tripType').value;
    
    if (!tripName || !duration || !budget || !startDate || !tripType) {
        alert('Please fill all required fields');
        return;
    }
    
    const tripPlan = {
        id: Date.now(),
        name: tripName,
        duration: duration,
        budget: budget,
        startDate: startDate,
        description: description,
        type: tripType,
        createdDate: new Date().toLocaleDateString(),
        spent: 0
    };
    
    tripPlans.push(tripPlan);
    localStorage.setItem(TRIP_PLANS_STORAGE_KEY, JSON.stringify(tripPlans));
    
    document.getElementById('tripPlannerForm').reset();
    displayTripPlans();
    alert('Trip plan created successfully!');
}

function displayTripPlans() {
    const tripsList = document.getElementById('tripsList');
    const noTrips = document.getElementById('noTrips');
    
    if (tripPlans.length === 0) {
        tripsList.innerHTML = '';
        noTrips.style.display = 'block';
        return;
    }
    
    tripsList.innerHTML = tripPlans.map(trip => `
        <div class="trip-plan-item ${trip.type}">
            <div class="trip-plan-content">
                <h4>🗺️ ${trip.name}</h4>
                <div class="trip-plan-details">
                    <div class="trip-plan-detail">
                        <span class="trip-plan-detail-label">Duration</span>
                        <span class="trip-plan-detail-value">${trip.duration} days</span>
                    </div>
                    <div class="trip-plan-detail">
                        <span class="trip-plan-detail-label">Budget</span>
                        <span class="trip-plan-detail-value">$${parseFloat(trip.budget).toFixed(2)}</span>
                    </div>
                    <div class="trip-plan-detail">
                        <span class="trip-plan-detail-label">Start Date</span>
                        <span class="trip-plan-detail-value">${trip.startDate}</span>
                    </div>
                    <div class="trip-plan-detail">
                        <span class="trip-plan-detail-label">Type</span>
                        <span class="trip-plan-detail-value">${trip.type}</span>
                    </div>
                </div>
                ${trip.description ? `<div class="trip-plan-description">${trip.description}</div>` : ''}
            </div>
            <div class="trip-plan-actions">
                <button class="trip-plan-edit-btn" onclick="editTripPlan(${trip.id})">Edit</button>
                <button class="trip-plan-delete-btn" onclick="deleteTripPlan(${trip.id})">Delete</button>
            </div>
        </div>
    `).join('');
    noTrips.style.display = 'none';
}

function deleteTripPlan(tripId) {
    if (confirm('Are you sure you want to delete this trip plan?')) {
        tripPlans = tripPlans.filter(t => t.id !== tripId);
        localStorage.setItem(TRIP_PLANS_STORAGE_KEY, JSON.stringify(tripPlans));
        displayTripPlans();
    }
}

function editTripPlan(tripId) {
    const trip = tripPlans.find(t => t.id === tripId);
    if (trip) {
        document.getElementById('tripName').value = trip.name;
        document.getElementById('tripDuration').value = trip.duration;
        document.getElementById('tripBudget').value = trip.budget;
        document.getElementById('tripStartDate').value = trip.startDate;
        document.getElementById('tripDescription').value = trip.description;
        document.getElementById('tripType').value = trip.type;
        
        tripPlans = tripPlans.filter(t => t.id !== tripId);
        localStorage.setItem(TRIP_PLANS_STORAGE_KEY, JSON.stringify(tripPlans));
        displayTripPlans();
        
        document.getElementById('trip-planner-section').scrollIntoView({ behavior: 'smooth' });
        alert('Trip plan loaded for editing. Update and create as new.');
    }
}

// ============================================
// FAVORITES MANAGEMENT
// ============================================

function loadFavorites() {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
        favorites = favorites.filter(f => f.touristEmail === touristData.email);
    }
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function toggleFavorite(tourId, tourName, tourPrice, source = 'featured') {
    const existingFav = favorites.findIndex(f => f.id === tourId && f.touristEmail === touristData.email && f.source === source);
    
    if (existingFav >= 0) {
        // Remove from favorites
        favorites.splice(existingFav, 1);
    } else {
        // Add to favorites
        favorites.push({
            id: tourId,
            name: tourName,
            price: tourPrice,
            source: source,
            touristEmail: touristData.email,
            addedDate: new Date().toISOString()
        });
    }
    
    saveFavorites();
    displayTours();
    displayManagerTours();
    displayFavoriteTours();
    updateStats();
}

function displayFavoriteTours() {
    const favoritesGrid = document.getElementById('favoritesToursGrid');
    const userFavorites = favorites.filter(f => f.touristEmail === touristData.email);
    
    if (userFavorites.length === 0) {
        favoritesGrid.innerHTML = '<p class="no-data">No favorites yet. Click the star icon on tours to add them!</p>';
        document.getElementById('favoritesTotalPrice').textContent = 'Total Price: $0';
        return;
    }
    
    const favHtml = userFavorites.map(fav => {
        const tourInfo = sampleTours.find(t => t.id === fav.id);
        const emoji = tourInfo ? tourInfo.emoji : '📍';
        return `
        <div class="tour-card">
            <div class="tour-image">${emoji}</div>
            <button class="favorite-btn active" onclick="toggleFavorite(${fav.id}, '${fav.name}', '${fav.price}')" title="Remove from favorites">
                ⭐
            </button>
            <div class="tour-content">
                <div class="tour-name">${fav.name}</div>
                <div class="tour-footer">
                    <span class="tour-price">${fav.price}</span>
                    <button class="tour-btn" onclick="bookTour(${fav.id}, '${fav.name}', '${fav.price}', '${tourInfo?.duration || '5 days'}')">Book Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    favoritesGrid.innerHTML = favHtml;
    
    // Calculate total price
    const totalPrice = userFavorites.reduce((sum, fav) => {
        const priceStr = fav.price.replace('$', '').replace(/,/g, '');
        return sum + (parseFloat(priceStr) || 0);
    }, 0);
    
    document.getElementById('favoritesTotalPrice').textContent = `Total Price: $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Password Change Functions
function openChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('active');
    document.getElementById('passwordError').classList.remove('show');
    document.getElementById('passwordSuccess').classList.remove('show');
    document.getElementById('changePasswordForm').reset();
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('changePasswordForm').reset();
}

function handleChangePassword(event, userType) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    const successDiv = document.getElementById('passwordSuccess');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    // Validation
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'New passwords do not match';
        errorDiv.classList.add('show');
        return;
    }
    
    if (newPassword === currentPassword) {
        errorDiv.textContent = 'New password must be different from current password';
        errorDiv.classList.add('show');
        return;
    }
    
    if (newPassword.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters';
        errorDiv.classList.add('show');
        return;
    }
    
    // Get current user data
    const session = localStorage.getItem('userSession');
    if (!session) {
        errorDiv.textContent = 'Session expired. Please log in again.';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const sessionData = JSON.parse(session);
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user
        const userIndex = users.findIndex(u => u.email === sessionData.email);
        if (userIndex === -1) {
            errorDiv.textContent = 'User not found';
            errorDiv.classList.add('show');
            return;
        }
        
        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            errorDiv.textContent = 'Current password is incorrect';
            errorDiv.classList.add('show');
            return;
        }
        
        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        successDiv.textContent = 'Password changed successfully!';
        successDiv.classList.add('show');
        
        // Close modal after 2 seconds
        setTimeout(() => {
            closeChangePasswordModal();
        }, 2000);
        
    } catch (error) {
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.classList.add('show');
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('changePasswordModal');
    if (event.target === modal) {
        closeChangePasswordModal();
    }
});
