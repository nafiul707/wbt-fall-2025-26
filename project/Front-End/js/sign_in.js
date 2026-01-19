// Hardcoded users data (stored in localStorage)
const DEFAULT_USERS = [
    {
        id: 1,
        user_name: 'John Doe',
        email: 'tourist@example.com',
        userid: 'tourist_001',
        password: 'tourist123',
        role: 'tourist',
        country: 'USA'
    },
    {
        id: 2,
        user_name: 'Jane Smith',
        email: 'manager@example.com',
        userid: 'manager_001',
        password: 'manager123',
        role: 'manager',
        country: 'UK',
        company: 'Adventure Tours Ltd',
        manager_license: 'MGR-12345'
    }
];

// Initialize users in localStorage if not exists
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }
}

// Get all users from localStorage
function getAllUsers() {
    initializeUsers();
    return JSON.parse(localStorage.getItem('users')) || DEFAULT_USERS;
}

// Find user by email
function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email === email);
}

// Handle sign-in form submission
document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('serverError');
    
    // Clear previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Validation
    if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password';
        errorDiv.style.display = 'block';
        return;
    }

    // Find user
    const user = findUserByEmail(email);

    if (!user) {
        errorDiv.textContent = 'Invalid email or password';
        errorDiv.style.display = 'block';
        return;
    }

    // Verify password
    if (user.password !== password) {
        errorDiv.textContent = 'Invalid email or password';
        errorDiv.style.display = 'block';
        return;
    }

    // Create session
    const sessionData = {
        email: user.email,
        fullname: user.user_name,
        role: user.role,
        userid: user.userid,
        loginTime: new Date().toLocaleString()
    };

    localStorage.setItem('userSession', JSON.stringify(sessionData));

    // Redirect based on role
    if (user.role === 'manager') {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'tourist_dashboard.html';
    }
});

// Show/Hide password toggle
document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = e.target.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            e.target.textContent = 'Hide';
        } else {
            input.type = 'password';
            e.target.textContent = 'Show';
        }
    });
});

// Initialize users on page load
initializeUsers();
