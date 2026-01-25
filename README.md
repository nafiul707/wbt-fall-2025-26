# WBT Fall 2025-26 Portfolio

This repository contains coursework for the Web-Based Technologies (WBT) Fall 2025-26 semester, including lab assessments, a personal portfolio website, and a comprehensive final project.

---

## 📋 Table of Contents

1. [Repository Overview](#repository-overview)
2. [Lab Assessment](#lab-assessment)
3. [Portfolio Website](#portfolio-website)
4. [MyTravel Project](#mytravel-project)
5. [Project Structure](#project-structure)
6. [Technologies Used](#technologies-used)


---

## 📚 Repository Overview

This repository serves as a comprehensive showcase of coursework and projects completed during the WBT Fall 2025-26 semester. It contains three main sections:

- **Lab Assessment**: Practical exercises in PHP covering fundamental programming concepts
- **Portfolio**: A personal portfolio website showcasing skills, education, experience, and projects
- **MyTravel Project**: A full-featured travel management system with tourist and manager portals

---

## 🧪 Lab Assessment

Located in the `lab assessment/` directory, this section contains practical PHP exercises demonstrating core programming concepts:

### PHP Exercises
- **AreaPerimeter.php** - Calculate area and perimeter of geometric shapes
- **CalculateVAT.php** - VAT (Value Added Tax) calculation
- **LargestNumber.php** - Find the largest number from a set
- **OddEven.php** - Determine if numbers are odd or even
- **PrintOddNumber.php** - Print odd numbers in a given range
- **SearchElement.php** - Search and locate elements in arrays

**Technologies**: PHP

---

## 🎨 Portfolio Website

Located in the `portfolio/` directory, this is a personal portfolio website that showcases professional information and projects.

### Features
- **Home Page** - Introduction and overview
- **Education** - Academic background and qualifications
- **Experience** - Professional experience and work history
- **Projects** - Showcase of completed projects
- **Contact** - Contact information and messaging capability

### Structure
```
portfolio/
├── index.html              # Main portfolio page
├── index.css               # Main portfolio styles
├── css/
│   ├── contactme.css       # Contact page styles
│   └── education.css       # Education page styles
└── html/
    ├── contactme.html      # Contact page
    ├── education.html      # Education page
    ├── experience.html     # Experience page
    └── project.html        # Projects page
```

**Technologies**: HTML, CSS

---

## 🌍 MyTravel Project

**MyTravel** is a full-featured travel management platform that enables tourists to discover, book, and manage travel experiences while allowing managers to create tours, track analytics, and oversee bookings. The system features real-time reactivity, interactive dashboards, gamification, and comprehensive analytics.

### 🎯 MyTravel Features Overview

#### Tourist Portal
✅ **Travel Analytics Dashboard** - Interactive charts showing spending by country, monthly trends, and trip statistics  
✅ **Smart Budget Tracker** - Real-time budget management with remaining balance tracking  
✅ **Travel Achievements & Gamification** - Badges for trip milestones (5 countries, 10 bookings, etc.)  
✅ **Favorites System** - Star/favorite tours with dynamic total price calculation  
✅ **Manager-Created Tours** - Book tours created by managers with full integration  
✅ **My Bookings** - View, edit, and cancel bookings with real-time status updates  
✅ **Profile Management** - View personal information and travel preferences  
✅ **Password Change** - Secure password update feature with validation  

#### Manager Portal
✅ **Revenue Analytics** - Track total revenue, average booking value, and revenue trends  
✅ **Booking Status Overview** - Real-time breakdown of bookings by status  
✅ **Tourist Growth & Insights** - Monitor tourist registrations by country and department  
✅ **User Management** - Full CRUD operations for managing tourists and staff  
✅ **Tour Creation & Management** - Create custom tours visible to all tourists  
✅ **Department Overview** - Interactive department cards with filtering and analytics  
✅ **Recent Bookings Table** - Monitor all bookings in real-time with detailed information  
✅ **Password Change** - Secure password update feature  

#### Public Landing Page
✅ **Featured Destinations** - Browse 6 curated travel destinations  
✅ **Seasonal Travel Packages** - Winter and Summer vacation offers  
✅ **Why Choose Us** - Benefits and value proposition  
✅ **Responsive Design** - Optimized for all devices  

---

## 📁 Complete Project Structure

```
wbt-fall-2025-26/
├── README.md                          # This file - Repository documentation
│
├── lab assessment/                    # PHP Lab Exercises
│   ├── css/                           # CSS files for exercises
│   ├── html/                          # HTML files for exercises
│   └── php/                           # PHP exercises
│       ├── AreaPerimeter.php
│       ├── CalculateVAT.php
│       ├── LargestNumber.php
│       ├── OddEven.php
│       ├── PrintOddNumber.php
│       └── SearchElement.php
│
├── portfolio/                         # Personal Portfolio Website
│   ├── index.html                     # Main portfolio page
│   ├── index.css                      # Main portfolio styles
│   ├── css/                           # Additional stylesheets
│   │   ├── contactme.css
│   │   └── education.css
│   ├── html/                          # Portfolio pages
│   │   ├── contactme.html
│   │   ├── education.html
│   │   ├── experience.html
│   │   └── project.html
│   ├── js/                            # JavaScript files
│   └── data/                          # Data files (if any)
│
└── project/                           # MyTravel - Main Project
    ├── Backend/                       # PHP Backend
    │   ├── sign_in.php               # Login handler
    │   ├── sign_up.php               # Registration handler
    │   ├── dashboard.php             # Manager dashboard backend
    │   └── tourist_dashboard.php     # Tourist dashboard backend
    │
    ├── Front-End/                    # Frontend Assets
    │   ├── html/                     # HTML Pages
    │   │   ├── index.html            # Landing page
    │   │   ├── sign_in.html          # Login page
    │   │   ├── sign_up.html          # Registration page
    │   │   ├── dashboard.html        # Manager dashboard
    │   │   └── tourist_dashboard.html # Tourist dashboard
    │   │
    │   ├── css/                      # Stylesheets
    │   │   ├── index.css              # Landing page styles
    │   │   ├── sign_in.css            # Login page styles
    │   │   ├── sign_up.css            # Registration page styles
    │   │   ├── dashboard.css          # Manager dashboard styles
    │   │   ├── features-analytics.css # Analytics features styles
    │   │   └── tourist_dashboard.css  # Tourist dashboard styles
    │   │
    │   └── js/                       # JavaScript Files
    │       ├── sign_in.js                # Login logic
    │       ├── sign_up.js                # Registration logic
    │       ├── dashboard.js              # Manager dashboard logic
    │       ├── features-analytics.js     # Analytics features logic
    │       ├── manager-analytics.js      # Manager analytics logic
    │       └── tourist_dashboard.js      # Tourist dashboard logic
    │
    └── images/                       # Image assets
```

---

## 🛠️ Technologies Used

### Lab Assessment
- **PHP** - Server-side scripting language
- **HTML** - Markup structure
- **CSS** - Styling

### Portfolio Website
- **HTML5** - Semantic markup
- **CSS3** - Modern styling and responsiveness
- **JavaScript** - Interactive features

### MyTravel Project
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend**: PHP (Server-side logic)
- **Database**: MySQL (for data persistence)
- **Features**: Interactive dashboards, real-time analytics, data visualization

---

## 📖 How to Run

### Lab Assessment
1. Place PHP files in your web server's document root
2. Access through `http://localhost/lab assessment/php/[filename].php`

### Portfolio Website
1. Open `portfolio/index.html` in a web browser
2. Navigate through the different sections (Education, Experience, Projects, Contact)

### MyTravel Project
1. Ensure PHP and MySQL are running
2. Set up the database with the required tables
3. Place the `project/` folder in your web server's document root
4. Access the application at `http://localhost/project/Front-End/html/index.html`
5. Sign up or log in to access the dashboards

---

## ✨ Key Features Summary

| Section | Key Highlights |
|---------|-----------------|
| **Lab Assessment** | PHP fundamentals, algorithms, data processing |
| **Portfolio** | Professional showcase, responsive design, multi-page navigation |
| **MyTravel Project** | Full-stack application, user authentication, analytics dashboards, gamification |

---

## 📝 Notes

This repository represents coursework for the WBT Fall 2025-26 semester. Each section demonstrates different aspects of web development skills including:

- Fundamental programming with PHP
- Frontend design and interactivity
- Full-stack project development
- Database integration
- Real-time data visualization and analytics

---

*Last Updated: January 22, 2026*