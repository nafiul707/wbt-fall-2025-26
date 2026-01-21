let users = [];
let managerData = {};
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadManagerProfile();
    loadUsers();
    loadManagedTours();
    setupEventListeners();
    updateStats();
    
    // Initialize manager analytics features
    initializeManagerAnalytics();
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
        
        // Check if user is a manager
        if (sessionData.role !== 'manager') {
            alert('Access denied. Only managers can access this dashboard.');
            window.location.href = 'tourist_dashboard.html';
            return;
        }

        managerData = sessionData;
        document.getElementById('userName').textContent = sessionData.fullname;
        document.getElementById('managerName').textContent = sessionData.fullname.split(' ')[0];
    } catch (error) {
        window.location.href = 'sign_in.html';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', handleSearch);
    }
    const tourForm = document.getElementById('tourForm');
    if (tourForm) {
        tourForm.addEventListener('submit', handleTourSubmit);
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

async function loadUsers() {
    try {
        // Load users from localStorage instead of backend
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        // Filter to get non-manager users for the manager dashboard
        users = allUsers.filter(u => u.role !== 'manager');
        displayUsers();
        updateStats();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display users in table
function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const noUsers = document.getElementById('noUsers');
    
    if (!tableBody) return;
    
    if (users.length === 0) {
        tableBody.innerHTML = '';
        noUsers.style.display = 'block';
        return;
    }
    
    noUsers.style.display = 'none';
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.user_name || user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.department || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value;
    
    if (!name || !email || !phone || !department) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Invalid email format', 'error');
        return;
    }
    
    try {
        let allUsers = JSON.parse(localStorage.getItem('users')) || [];
        
        if (editingId) {
            // Update existing user
            const userIndex = allUsers.findIndex(u => u.id == editingId);
            if (userIndex !== -1) {
                allUsers[userIndex].user_name = name;
                allUsers[userIndex].email = email;
                allUsers[userIndex].phone = phone;
                allUsers[userIndex].department = department;
            }
        } else {
            // Create new user
            const newUser = {
                id: Math.max(...allUsers.map(u => u.id), 0) + 1,
                user_name: name,
                email: email,
                phone: phone,
                department: department,
                role: 'tourist',
                userid: 'user_' + Date.now(),
                password: 'default123',
                country: 'Not specified'
            };
            allUsers.push(newUser);
        }
        
        localStorage.setItem('users', JSON.stringify(allUsers));
        showMessage(editingId ? 'User updated successfully' : 'User added successfully', 'success');
        resetForm();
        await loadUsers();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Edit user
function editUser(id) {
    const user = users.find(u => u.id == id);
    if (!user) return;
    
    document.getElementById('name').value = user.user_name || user.name || '';
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('department').value = user.department || '';
    
    editingId = id;
    document.getElementById('formTitle').textContent = 'Edit User';
    document.getElementById('submitBtn').textContent = 'Update User';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    showSection(null, 'users');
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        let allUsers = JSON.parse(localStorage.getItem('users')) || [];
        allUsers = allUsers.filter(u => u.id != id);
        localStorage.setItem('users', JSON.stringify(allUsers));
        
        showMessage('User deleted successfully', 'success');
        await loadUsers();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Reset form
function resetForm() {
    document.getElementById('userForm').reset();
    editingId = null;
    document.getElementById('formTitle').textContent = 'Add New User';
    document.getElementById('submitBtn').textContent = 'Add User';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Search users
async function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        await loadUsers();
        return;
    }
    
    try {
        let allUsers = JSON.parse(localStorage.getItem('users')) || [];
        allUsers = allUsers.filter(u => u.role !== 'manager');
        users = allUsers.filter(u => 
            (u.user_name && u.user_name.toLowerCase().includes(searchTerm)) ||
            (u.email && u.email.toLowerCase().includes(searchTerm)) ||
            (u.userid && u.userid.toLowerCase().includes(searchTerm))
        );
        displayUsers();
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadUsers();
}

// Display message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 12px 15px;
        margin-bottom: 15px;
        border-radius: 4px;
        font-weight: bold;
        ${type === 'success' 
            ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
            : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    
    const section = document.getElementById('users-section');
    if (section && section.firstChild) {
        section.insertBefore(messageDiv, section.firstChild);
    }
    setTimeout(() => messageDiv.remove(), 4000);
}

// Show/hide sections
function showSection(event, sectionId) {
    if (event) event.preventDefault();
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId + '-section').classList.add('active');
    
    // Update menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event?.target.closest('.menu-item')?.classList.add('active');
}

// Load manager profile
function loadManagerProfile() {
    try {
        const session = localStorage.getItem('userSession');
        if (session) {
            const sessionData = JSON.parse(session);
            document.getElementById('profileFullName').textContent = sessionData.fullname || '-';
            document.getElementById('profileEmail').textContent = sessionData.email || '-';
            document.getElementById('profileUserID').textContent = sessionData.userid || '-';
            document.getElementById('profileLicense').textContent = sessionData.manager_license || '-';
            document.getElementById('profileCompany').textContent = sessionData.company || '-';
            document.getElementById('profileStartDate').textContent = sessionData.startdate || '-';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalUsersCount').textContent = users.length;
    
    // Count unique departments
    const departments = new Set(users.map(u => u.department));
    document.getElementById('totalDepartments').textContent = departments.size;
    
    // Count active users (all users in this case)
    document.getElementById('activeUsers').textContent = users.length;
    
    // Update department overview
    updateDepartmentOverview();
}

// Update department overview with interactive cards and chart
function updateDepartmentOverview() {
    const departmentCounts = {};
    const departments = ['IT', 'HR', 'Finance', 'Sales', 'Marketing'];
    
    // Initialize all departments
    departments.forEach(dept => {
        departmentCounts[dept] = 0;
    });
    
    // Count users by department
    users.forEach(user => {
        if (user.department && departmentCounts.hasOwnProperty(user.department)) {
            departmentCounts[user.department]++;
        }
    });
    
    // Render department cards
    const gridDiv = document.getElementById('departmentGrid');
    gridDiv.innerHTML = departments.map(dept => `
        <div class="dept-card ${dept.toLowerCase()}" onclick="filterByDepartment('${dept}')">
            <div class="dept-name">${dept}</div>
            <div class="dept-count">${departmentCounts[dept]}</div>
            <div class="dept-label">Users</div>
        </div>
    `).join('');
    
    // Initialize department chart
    initializeDepartmentChart(departmentCounts, departments);
}

// Initialize department distribution chart
let deptChart = null;
function initializeDepartmentChart(counts, departments) {
    const ctx = document.getElementById('deptChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    if (deptChart) deptChart.destroy();
    
    const chartData = departments.map(d => counts[d]);
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
    
    deptChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: departments,
            datasets: [{
                label: 'Users by Department',
                data: chartData,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Filter users by department
function filterByDepartment(department) {
    const filtered = users.filter(u => u.department === department);
    const tableBody = document.getElementById('usersTableBody');
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center">No users in ${department}</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = filtered.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.user_name || user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.department || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    showSection(null, 'users');
}

// Validate email
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'sign_in.html';
    }
}

// ============================================
// TOUR MANAGEMENT FUNCTIONS
// ============================================

const MANAGED_TOURS_KEY = 'managerCreatedTours';

// Load managed tours from localStorage
function loadManagedTours() {
    const toursDiv = document.getElementById('managedToursGrid');
    const noToursMsg = document.getElementById('noToursMsg');
    
    if (!toursDiv) return;
    
    const tours = JSON.parse(localStorage.getItem(MANAGED_TOURS_KEY)) || [];
    
    if (tours.length === 0) {
        toursDiv.innerHTML = '';
        noToursMsg.style.display = 'block';
        return;
    }
    
    noToursMsg.style.display = 'none';
    toursDiv.innerHTML = tours.map(tour => `
        <div class="tour-card">
            <div class="tour-header">
                <h4>${tour.name}</h4>
                <button class="tour-delete-btn" onclick="deleteTour(${tour.id})">Delete</button>
            </div>
            <p class="tour-location">📍 ${tour.location}</p>
            <p class="tour-description">${tour.description}</p>
            <div class="tour-meta">
                <div class="tour-meta-item">
                    <span class="tour-meta-label">Price</span>
                    <span class="tour-meta-value">$${parseFloat(tour.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="tour-meta-item">
                    <span class="tour-meta-label">Duration</span>
                    <span class="tour-meta-value">${tour.duration} days</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle tour form submission
function handleTourSubmit(e) {
    e.preventDefault();
    
    const tourName = document.getElementById('tourName').value.trim();
    const tourLocation = document.getElementById('tourLocation').value.trim();
    const tourPrice = document.getElementById('tourPrice').value.trim();
    const tourDuration = document.getElementById('tourDuration').value.trim();
    const tourDescription = document.getElementById('tourDescription').value.trim();
    
    if (!tourName || !tourLocation || !tourPrice || !tourDuration || !tourDescription) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const tours = JSON.parse(localStorage.getItem(MANAGED_TOURS_KEY)) || [];
        
        const newTour = {
            id: Date.now(),
            name: tourName,
            location: tourLocation,
            price: parseFloat(tourPrice),
            priceNum: parseFloat(tourPrice),
            duration: parseInt(tourDuration),
            description: tourDescription,
            createdAt: new Date().toISOString(),
            createdBy: managerData.email
        };
        
        tours.push(newTour);
        localStorage.setItem(MANAGED_TOURS_KEY, JSON.stringify(tours));
        
        alert('Tour created successfully!');
        document.getElementById('tourForm').reset();
        loadManagedTours();
    } catch (error) {
        alert('Error creating tour: ' + error.message);
    }
}

// Delete a tour
function deleteTour(tourId) {
    if (!confirm('Are you sure you want to delete this tour? Tourists won\'t be able to see or book it anymore.')) {
        return;
    }
    
    try {
        let tours = JSON.parse(localStorage.getItem(MANAGED_TOURS_KEY)) || [];
        tours = tours.filter(t => t.id !== tourId);
        localStorage.setItem(MANAGED_TOURS_KEY, JSON.stringify(tours));
        
        alert('Tour deleted successfully!');
        loadManagedTours();
    } catch (error) {
        alert('Error deleting tour: ' + error.message);
    }
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