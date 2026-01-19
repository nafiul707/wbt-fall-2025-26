// Get users from localStorage (shared with sign_in.js)
function getAllUsers() {
    initializeUsers();
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Initialize users in localStorage if not exists
function initializeUsers() {
    if (!localStorage.getItem('users')) {
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
        localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for hidden class if not exists
    if (!document.getElementById('signup-styles')) {
        const style = document.createElement('style');
        style.id = 'signup-styles';
        style.textContent = '.hidden { display: none !important; }';
        document.head.appendChild(style);
    }

    // Initialize - hide manager fields by default
    const managerFields = document.getElementById('manager-fields');
    if (managerFields) {
        managerFields.classList.add('hidden');
    }

    // Toggle manager fields based on role selection
    const roleRadios = document.querySelectorAll('input[name="role"]');
    roleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const managerFields = document.getElementById('manager-fields');
            if (this.value === 'manager') {
                managerFields.classList.remove('hidden');
                document.querySelector('input[name="country"]').required = true;
                document.querySelector('input[name="company"]').required = true;
                document.querySelector('input[name="managerid"]').required = true;
            } else {
                managerFields.classList.add('hidden');
                document.querySelector('input[name="country"]').required = false;
                document.querySelector('input[name="company"]').required = false;
                document.querySelector('input[name="managerid"]').required = false;
            }
        });
    });
});

// Handle sign-up form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const role = document.querySelector('input[name="role"]:checked')?.value;
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm').value.trim();
        const errorDiv = document.getElementById('serverError');
        const successDiv = document.getElementById('serverSuccess');
        
        if (!errorDiv || !successDiv) {
            console.error('Error or Success div not found');
            return;
        }
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        errorDiv.textContent = '';
        successDiv.textContent = '';
        
        if (!role) {
            errorDiv.textContent = 'Please select a role';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (!fullname || !email || !password || !confirmPassword) {
            errorDiv.textContent = 'Please fill all fields';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (password.length < 8) {
            errorDiv.textContent = 'Password must be at least 8 characters';
            errorDiv.style.display = 'block';
            return;
        }

        // Check if email already exists
        const users = getAllUsers();
        if (users.some(u => u.email === email)) {
            errorDiv.textContent = 'Email already registered';
            errorDiv.style.display = 'block';
            return;
        }
        
        try {
            const country = document.getElementById('country').value.trim();
            
            // Create new user object
            let newUser = {
                id: users.length + 1,
                user_name: fullname,
                email: email,
                userid: role === 'manager' ? 'manager_' + (users.length + 1) : 'tourist_' + (users.length + 1),
                password: password,
                role: role,
                country: country
            };

            // Add manager-specific fields if manager
            if (role === 'manager') {
                newUser.company = document.getElementById('company').value.trim();
                newUser.manager_license = document.getElementById('managerid').value.trim();
            }

            // Add to users array
            users.push(newUser);
            saveUsers(users);

            successDiv.textContent = 'Account created successfully! Redirecting to sign in...';
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = 'sign_in.html';
            }, 2000);
        } catch (error) {
            errorDiv.textContent = 'Error: ' + error.message;
            errorDiv.style.display = 'block';
        }
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show/Hide password toggle - Add within DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
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
});

// Initialize users on page load
initializeUsers();
