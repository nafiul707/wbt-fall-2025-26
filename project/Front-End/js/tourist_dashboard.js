// Tourist Dashboard Script with Booking Management

let touristData = {};
let tourBookings = [];
let managedBookings = [];
let editingBookingId = null;
let editingBookingType = null;
const TOUR_BOOKINGS_STORAGE_KEY = 'touristTourBookings';
const MANAGED_BOOKINGS_STORAGE_KEY = 'touristManagedBookings';

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
    setupEventListeners();
    displayTours();
    updateStats();
    
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
        
        console.log('Rendering booking:', booking.id, 'Type:', booking.bookingType, 'Price:', booking.price);
        
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
            status: status,
            notes: notes,
            touristEmail: touristData.email,
            touristName: touristData.fullname,
            createdDate: new Date().toISOString()
        };
        managedBookings.push(newBooking);
        console.log('New booking created:', newBooking);
        alert('Booking confirmed successfully!');
        saveManagedBookings();
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
    const toursGrid = document.getElementById('toursGrid');

    const tourHtml = sampleTours.map(tour => `
        <div class="tour-card">
            <div class="tour-image">${tour.emoji}</div>
            <div class="tour-content">
                <div class="tour-name">${tour.name}</div>
                <div class="tour-desc">${tour.description}</div>
                <div class="tour-footer">
                    <span class="tour-price">${tour.price}</span>
                    <button class="tour-btn" onclick="bookTour(${tour.id}, '${tour.name}', '${tour.price}', '${tour.duration}')">Book Now</button>
                </div>
            </div>
        </div>
    `).join('');

    if (featuredToursGrid) {
        featuredToursGrid.innerHTML = tourHtml;
    }

    if (toursGrid) {
        toursGrid.innerHTML = tourHtml;
    }
}

// Book tour
function bookTour(tourId, tourName, price, duration) {
    const booking = {
        id: 'BK' + Date.now(),
        tourId: tourId,
        tourName: tourName,
        price: price,
        duration: duration,
        destination: sampleTours.find(t => t.id === tourId)?.name || 'Tour Destination',
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
}

// Update stats
function updateStats() {
    document.getElementById('upcomingBookings').textContent = tourBookings.length;
    document.getElementById('completedTours').textContent = Math.floor(tourBookings.length * 0.5);
    document.getElementById('favoriteTours').textContent = Math.floor(Math.random() * 5);
}
