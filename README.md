# MyTravel - Tourist Registration & Login

## Simple 3-Step Setup

### Step 1: Create Database Table
Run this SQL in MySQL (phpMyAdmin):

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    userid VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('tourist', 'manager') NOT NULL,
    company VARCHAR(255),
    manager_license VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delete existing demo users first
DELETE FROM users WHERE email IN ('tourist@example.com', 'manager@example.com');

-- Insert demo users with CORRECT password hashes
INSERT INTO users (user_name, email, country, userid, password, role) VALUES 
('John Tourist', 'tourist@example.com', 'Bangladesh', 'tourist1', '$2y$10$WCq7WM29rcXQQWLYH.6m5e7zKVYFrC6B9FqGv7w5P4LvX0NZUmZDK', 'tourist'),
('Jane Manager', 'manager@example.com', 'United States', 'manager1', '$2y$10$nOADDPAd4KKYgk5NnCHCZOqS3s8fEHqg3J5rN4SJjBYH1Ybn8e8M2', 'manager');
```

OR use: `create_users_table.sql`

### Step 2: Register a Tourist
1. Open: `http://localhost/wbt-fall-2025-26/project/Front-End/html/sign_up.html`
2. Fill form with tourist details (email, password, etc)
3. Click "Create Account"
4. Data is saved in database

### Step 3: Login
1. Open: `http://localhost/wbt-fall-2025-26/project/Front-End/html/sign_in.html`
2. Enter email and password
3. View your dashboard

## Demo Login
- Email: `tourist@example.com` / Password: `password123`
- Email: `manager@example.com` / Password: `manager123`

## How It Works

**Registration:** sign_up.html → sign_up.js → Backend/signup.php → Database

**Login:** sign_in.html → sign_in.js → Backend/signin.php → Database

That's it!