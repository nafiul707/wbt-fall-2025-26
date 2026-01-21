# 🌍 MyTravel - Comprehensive Travel Management System

**MyTravel** is a full-featured travel management platform that enables tourists to discover, book, and manage travel experiences while allowing managers to create tours, track analytics, and oversee bookings. The system features real-time reactivity, interactive dashboards, gamification, and comprehensive analytics.

---

## 📋 Table of Contents

1. [Features Overview](#features-overview)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Authentication & Login](#authentication--login)
5. [Tourist Dashboard Features](#tourist-dashboard-features)
6. [Manager Dashboard Features](#manager-dashboard-features)
7. [Technologies Used](#technologies-used)
8. [File Organization](#file-organization)
9. [Data Storage](#data-storage)
10. [API & Functions](#api--functions)

---

## 🎯 Features Overview

### Tourist Portal
✅ **Travel Analytics Dashboard** - Interactive charts showing spending by country, monthly trends, and trip statistics  
✅ **Smart Budget Tracker** - Real-time budget management with remaining balance tracking  
✅ **Travel Achievements & Gamification** - Badges for trip milestones (5 countries, 10 bookings, etc.)  
✅ **Favorites System** - Star/favorite tours with dynamic total price calculation  
✅ **Manager-Created Tours** - Book tours created by managers with full integration  
✅ **My Bookings** - View, edit, and cancel bookings with real-time status updates  
✅ **Profile Management** - View personal information and travel preferences  
✅ **Password Change** - Secure password update feature with validation  

### Manager Portal
✅ **Revenue Analytics** - Track total revenue, average booking value, and revenue trends  
✅ **Booking Status Overview** - Real-time breakdown of bookings by status  
✅ **Tourist Growth & Insights** - Monitor tourist registrations by country and department  
✅ **User Management** - Full CRUD operations for managing tourists and staff  
✅ **Tour Creation & Management** - Create custom tours visible to all tourists  
✅ **Department Overview** - Interactive department cards with filtering and analytics  
✅ **Recent Bookings Table** - Monitor all bookings in real-time with detailed information  
✅ **Password Change** - Secure password update feature  

### Public Landing Page
✅ **Featured Destinations** - Browse 6 curated travel destinations  
✅ **Seasonal Travel Packages** - Winter and Summer vacation offers  
✅ **Why Choose Us** - Benefits and value proposition  
✅ **Responsive Design** - Optimized for all devices  

---

## 📁 Project Structure

```
wbt-fall-2025-26/
├── README.md                          # Project documentation
├── portfolio/                         # Portfolio website
│   ├── index.html
│   ├── index.css
│   ├── css/
│   │   ├── contactme.css
│   │   ├── education.css
│   └── html/
│       ├── contactme.html
│       ├── education.html
│       ├── experience.html
│       └── project.html
├── lab assessment/
│   ├── css/
│   ├── html/
│   └── php/
│       ├── AreaPerimeter.php
│       ├── CalculateVAT.php
│       ├── LargestNumber.php
│       ├── OddEven.php
│       ├── PrintOddNumber.php
│       └── SearchElement.php
└── project/                           # Main MyTravel Application
    ├── Backend/
    │   ├── sign_in.php               # Login handler
    │   ├── sign_up.php               # Registration handler
    │   ├── dashboard.php             # Manager dashboard backend
    │   └── tourist_dashboard.php     # Tourist dashboard backend
    ├── Front-End/
    │   ├── html/
    │   │   ├── index.html            # Landing page
    │   │   ├── sign_in.html          # Login page
    │   │   ├── sign_up.html          # Registration page
    │   │   ├── dashboard.html        # Manager dashboard
    │   │   ├── tourist_dashboard.html # Tourist dashboard
    │   └── css/
    │       ├── index.css              # Landing page styles
    │       ├── sign_in.css            # Login page styles
    │       ├── sign_up.css            # Registration page styles
    │       ├── dashboard.css          # Manager dashboard styles
    │       └── tourist_dashboard.css  # Tourist dashboard styles
    └── js/
        ├── sign_in.js                # Login logic
        ├── sign_up.js                # Registration logic
        ├── dashboard.js              # Manager dashboard logic (521+ lines)
        ├── tourist_dashboard.js      # Tourist dashboard logic (1290+ lines)
        ├── manager-analytics.js      # Manager analytics features (600+ lines)
        └── features-analytics.js     # Tourist analytics features (700+ lines)
```

---

## 🚀 Setup Instructions

### Prerequisites
- PHP 7.0+
- MySQL 5.7+
- Web Server (Apache/Nginx)
- Modern Web Browser

### Step 1: Database Setup

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

-- Insert demo users (plaintext passwords for localStorage)
INSERT INTO users (user_name, email, country, userid, password, role) VALUES 
('John Doe', 'tourist@example.com', 'Bangladesh', 'tourist1', 'password123', 'tourist'),
('Jane Smith', 'manager@example.com', 'United States', 'manager1', 'manager123', 'manager');
```

### Step 2: Configure Server Path

1. Ensure project is in web root: `htdocs/wbt-fall-2025-26/`
2. Access URL: `http://localhost/wbt-fall-2025-26/`

### Step 3: Access the Application

- **Landing Page:** `http://localhost/wbt-fall-2025-26/project/Front-End/html/index.html`
- **Registration:** `http://localhost/wbt-fall-2025-26/project/Front-End/html/sign_up.html`
- **Login:** `http://localhost/wbt-fall-2025-26/project/Front-End/html/sign_in.html`

---

## 🔐 Authentication & Login

### Demo Credentials

| Role | Email | Password | 
|------|-------|----------|
| Tourist | `tourist@example.com` | `password123` |
| Manager | `manager@example.com` | `manager123` |

### How Authentication Works

1. **Sign Up** → User data stored in `users` table
2. **Login** → Credentials verified, session created in localStorage
3. **Session Token** → `userSession` object stored with user info and role
4. **Dashboard Access** → Role-based access control redirects to appropriate portal

### Password Change Feature
- Both tourists and managers can change passwords from their profile sections
- **Requirements:**
  - Current password verification
  - New password must be different from current
  - Minimum 8 characters
  - Password confirmation must match
  - Passwords stored in localStorage for demo (in production, use hashing)

---

## 👥 Tourist Dashboard Features

### 1. Home Section
- **Welcome Message** - Personalized greeting
- **Quick Stats:**
  - Completed Tours
  - Upcoming Bookings
  - Favorite Tours
  - Total Spent ($)
- **Manager Tours** - All tours created by managers
- **Favorites Section** - Star-marked tours with dynamic total price

### 2. Travel Analytics Dashboard
**Real-time interactive charts showing:**
- **Spending by Country** - Horizontal bar chart
- **Monthly Spending Trend** - Interactive area chart
- **Trip Statistics** - Total trips, average spend, countries visited

**Features:**
- Updates automatically when booking/canceling tours
- Country-based data aggregation
- Interactive chart interactions

### 3. Smart Budget Tracker
**Budget Management:**
- Set initial budget
- Remaining balance calculation
- Spent amount tracking
- Budget percentage visualization
- Real-time updates on every booking

### 4. Travel Achievements & Gamification
**Badge System:**
- 🏆 Explorer (5+ countries visited)
- 🚀 Adventure Seeker (10+ bookings)
- 💰 Budget Master (Under 20% spending)
- 👑 VIP Traveler (Spent 10,000+)
- 🌟 Favorite Collector (10+ favorites)

**Features:**
- Automatic badge unlocking
- Progress tracking toward next badges
- Visual badge display with descriptions

### 5. My Bookings Section
**View All Bookings:**
- Tour name and date
- Duration and booking status
- Edit/Cancel options
- Real-time status updates

### 6. Profile Section
- Display user information
- Email and country
- Change password option

---

## 👔 Manager Dashboard Features

### 1. Dashboard Home
**Department Overview:**
- Interactive department cards
- Click to filter users by department
- Department distribution bar chart
- User count per department

### 2. User Management
**Features:**
- View all tourists and staff
- Add new users
- Edit user information
- Delete users
- Filter by department
- Display: Name, Email, Country, Phone, Department, Created Date

### 3. Revenue Analytics
**Analytics Tracked:**
- Total Revenue
- Average Booking Value
- Revenue Trend (30 days)
- Interactive revenue chart

### 4. Booking Status Overview
**Status Breakdown:**
- Active Bookings
- Cancelled Bookings
- Completed Bookings
- Recent bookings table with all details

### 5. Tourist Growth & Insights
**Metrics:**
- Total Tourists
- New Registrations (30 days)
- Active Tourists
- Tourist distribution by country/location
- Interactive growth chart

### 6. Tour Management (Manage Tours)
**Create Tours:**
- Tour name, location, price, duration, description
- Tours saved to localStorage
- Immediately visible to all tourists

**Manage Tours:**
- View all created tours
- Delete tours
- Changes sync in real-time

### 7. Profile & Settings
- Manager information display
- Change password option

---

## 🛠 Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, animations, responsive design
- **Vanilla JavaScript** - No frameworks, pure JS for all interactions
- **Chart.js 3.9.1** - Interactive charts and data visualization (via CDN)

### Backend
- **PHP 7.0+** - Server-side logic
- **MySQL 5.7+** - Database management

### Storage
- **LocalStorage** - Client-side data persistence (demo mode)
- **MySQL Database** - Server-side data persistence

### Key Libraries
- Chart.js for analytics visualization
- No external JS frameworks (vanilla implementation)

---

## 📊 Data Storage & LocalStorage Keys

### Tourist Data
```javascript
'users'                    // All user profiles
'userSession'              // Current logged-in user
'touristTourBookings'      // Featured tour bookings
'touristManagedBookings'   // Manager-created tour bookings
'touristFavorites'         // Favorited tours
'userBudget'               // Tourist budget data
```

### Manager Data
```javascript
'managerCreatedTours'      // Tours created by manager
'departmentFilters'        // Applied filters
```

### Data Structure Examples

**User Object:**
```javascript
{
    id: 1,
    fullname: "John Doe",
    email: "tourist@example.com",
    country: "Bangladesh",
    userid: "tourist1",
    password: "password123",
    role: "tourist",
    phone: "1234567890",
    department: "Travel",
    startdate: "2024-01-15"
}
```

**Booking Object:**
```javascript
{
    id: 1,
    tourId: 1,
    tourName: "Paris City Tour",
    userId: "tourist1",
    bookingDate: "2024-01-20",
    tourDate: "2024-02-15",
    price: "$1,200",
    status: "active",
    duration: "5 days"
}
```

**Tour Object:**
```javascript
{
    id: "tour_1704067200000",
    name: "Mountain Adventure",
    location: "Swiss Alps",
    price: "$2,500",
    duration: "7 days",
    description: "Exciting mountain hiking experience"
}
```

---

## 🎨 CSS Features

### Tourist Dashboard Styling
- Blue gradient navbar with sticky positioning
- Card-based layout for bookings and tours
- Responsive grid system (1-3 columns)
- Modal dialogs for forms and password changes
- Animated chart containers
- Color-coded achievement badges
- Gradient section headers (favorites, manager tours)

### Manager Dashboard Styling
- Professional dashboard layout
- Color-coded stat cards
- Department-colored cards (blue, green, orange, purple)
- Interactive hover effects
- Modal forms for user and tour creation
- Responsive table displays
- Chart visualization containers

### Animations
- Fade-in modal overlays
- Slide-in modal content
- Smooth transitions on hover
- Chart animations on load

---

## 📱 Responsive Design

- **Mobile First** - 320px and above
- **Tablet** - 768px breakpoints
- **Desktop** - 1200px+ optimized layout
- Flexible grid layouts
- Responsive navigation
- Touch-friendly buttons and forms

---

## 🔄 Real-Time Reactivity

The application features **cascading updates** where changes in one area automatically update all related components:

1. **When Booking a Tour:**
   - Budget remaining updates
   - Total spent increases
   - Monthly spending chart updates
   - Country spending chart updates
   - Achievements check for new badges
   - Manager dashboard sees new booking

2. **When Canceling a Tour:**
   - All features revert in real-time
   - Budget recalculates
   - Analytics update
   - Achievements may be lost

3. **When Favoriting a Tour:**
   - Star icon highlights
   - Favorites section updates
   - Total favorite price changes
   - Favorite count in stats updates

4. **When Manager Creates Tour:**
   - All tourists see new tour immediately
   - Available for booking
   - Integrates with all tourist features

---

## 🎯 API & Key Functions

### Tourist Dashboard Functions

```javascript
// Authentication
checkSession()                    // Verify user login
loadTouristProfile()             // Load user information

// Bookings
bookTour(tourId, name, price, duration)
cancelBooking(bookingId, bookingType)
editBooking(bookingId, bookingType)
loadBookings()                   // Display all bookings

// Favorites
toggleFavorite(tourId, name, price, source)
displayFavoriteTours()           // Show favorite tours

// Analytics
updateTravelAnalytics()          // Update charts and stats
calculateMonthlySpending()       // Aggregate monthly data
calculateSpendingByCountry()     // Country-based analytics

// Budget
updateBudgetTracker()            // Update budget display
calculateRemainingBudget()       // Calculate available budget

// Achievements
checkAchievements()              // Check badge conditions
updateAchievementStats()         // Display badges

// Password
openChangePasswordModal()        // Show password modal
handleChangePassword(event, userType)  // Update password
```

### Manager Dashboard Functions

```javascript
// Authentication
checkSession()                   // Verify manager login
loadManagerProfile()             // Load manager info

// User Management
loadUsers()                      // Display all users
handleFormSubmit()               // Add/edit user
deleteUser(userId)               // Remove user
displayUsers()                   // Render users table

// Analytics
updateRevenueStats()             // Calculate revenue
updateBookingStatusStats()       // Booking breakdown
updateTouristStats()             // Tourist growth data
initializeTouristGrowthCharts()  // Chart initialization

// Tour Management
loadManagedTours()               // Display manager tours
handleTourSubmit()               // Create new tour
deleteTour(tourId)               // Remove tour

// Department Management
updateDepartmentOverview()       // Show departments
filterByDepartment(dept)         // Filter users

// Password
openChangePasswordModal()        // Show password modal
handleChangePassword(event, userType)  // Update password
```

---

## 🐛 Troubleshooting

### Issues & Solutions

| Issue | Solution |
|-------|----------|
| Login not working | Check MySQL database has users table and demo accounts |
| Charts not displaying | Ensure Chart.js CDN is loaded (check browser console) |
| Bookings not saving | Check browser localStorage is enabled |
| Password change not working | Verify current password matches exactly |
| Manager tours not visible | Check 'managerCreatedTours' key in localStorage |
| Real-time updates not working | Clear localStorage and refresh page |

---

## 📝 Default Test Data

### Featured Tours (Pre-loaded)
1. Paris City Tour - $1,200 (5 days)
2. Tokyo Adventure - $1,500 (6 days)
3. New York Explorer - $1,000 (4 days)
4. Dubai Luxury - $1,800 (5 days)
5. Barcelona Beach - $1,100 (4 days)
6. Rome Historical - $1,400 (5 days)

### Sample Manager Tours
Created by managers in the dashboard and stored in localStorage

---

## 🔒 Security Notes

**Current Implementation (Demo Mode):**
- Passwords stored in plaintext in localStorage
- Session validation on page load
- Email uniqueness enforced

**Production Recommendations:**
- Use password hashing (bcrypt/password_hash)
- Implement JWT tokens
- Use HTTPS
- Add CSRF protection
- Implement rate limiting
- Add input validation/sanitization
- Use secure session management
- Encrypt sensitive data

---

## 📄 License

This project is created for educational purposes.

---

## 👨‍💻 Developer Notes

### Code Statistics
- **Tourist Dashboard JS:** 1290+ lines
- **Manager Dashboard JS:** 520+ lines
- **Manager Analytics JS:** 600+ lines
- **Tourist Analytics JS:** 700+ lines
- **CSS Files:** 2000+ lines (responsive, animated)
- **HTML Files:** 5 main pages

### Performance Optimizations
- LocalStorage caching for instant loads
- Minimal external dependencies
- Vanilla JS (no framework overhead)
- Efficient DOM manipulation
- Event delegation for better memory usage

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack web development (HTML/CSS/JS + PHP/MySQL)
- Real-time data synchronization
- Interactive data visualization
- Responsive design principles
- State management with localStorage
- Role-based access control
- CRUD operations
- Advanced JavaScript (closures, callbacks, event handling)
- Chart.js integration
- User authentication & authorization

---

**Last Updated:** January 2026  
**Version:** 1.0 - Complete Feature Release

**Login:** sign_in.html → sign_in.js → Backend/signin.php → Database

That's it!