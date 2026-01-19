let users = [];
let managerData = {};
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadManagerProfile();
    loadUsers();
    setupEventListeners();
    updateStats();
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
            <td>${user.userid || 'N/A'}</td>
            <td>${user.role || 'N/A'}</td>
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
