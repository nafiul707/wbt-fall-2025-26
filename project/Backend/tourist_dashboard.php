<?php
// Auto-create database and tables
$conn = mysqli_connect("localhost", "root", "");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

// Create database
$sql_db = "CREATE DATABASE IF NOT EXISTS testdb";
mysqli_query($conn, $sql_db);

// Select database
mysqli_select_db($conn, "testdb");

// Create bookings table if not exists
$sql_table = "CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    place VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    booking_type VARCHAR(50) DEFAULT 'custom',
    tourist_email VARCHAR(100),
    tourist_name VARCHAR(100),
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
mysqli_query($conn, $sql_table);

$error = "";
$success = "";

// Handle CREATE - Add new booking
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'create') {
    $place = $_POST["place"] ?? '';
    $location = $_POST["location"] ?? '';
    $check_in = $_POST["check_in"] ?? '';
    $check_out = $_POST["check_out"] ?? '';
    $price = $_POST["price"] ?? '';
    $status = $_POST["status"] ?? 'Pending';
    $booking_type = $_POST["booking_type"] ?? 'custom';
    $tourist_email = $_POST["tourist_email"] ?? '';
    $tourist_name = $_POST["tourist_name"] ?? '';
    $notes = $_POST["notes"] ?? '';

    if (empty($place) || empty($location) || empty($check_in) || empty($check_out) || empty($price)) {
        $error = "Place, location, check-in, check-out and price are required";
    } else {
        $sql = "INSERT INTO bookings 
                (place, location, check_in, check_out, price, status, booking_type, tourist_email, tourist_name, notes, created_date)
                VALUES ('$place', '$location', '$check_in', '$check_out', '$price', '$status', '$booking_type', '$tourist_email', '$tourist_name', '$notes', NOW())";
        
        if (mysqli_query($conn, $sql)) {
            $success = "Booking created successfully!";
            $_POST = array();
        } else {
            $error = "Error: " . mysqli_error($conn);
        }
    }
}

// Handle UPDATE - Modify booking
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'update') {
    $booking_id = $_POST["booking_id"] ?? 0;
    $place = $_POST["place"] ?? '';
    $location = $_POST["location"] ?? '';
    $check_in = $_POST["check_in"] ?? '';
    $check_out = $_POST["check_out"] ?? '';
    $price = $_POST["price"] ?? '';
    $status = $_POST["status"] ?? '';
    $notes = $_POST["notes"] ?? '';

    if (empty($place) || empty($location) || empty($check_in) || empty($check_out) || empty($price)) {
        $error = "Place, location, check-in, check-out and price are required";
    } else {
        $sql = "UPDATE bookings 
                SET place='$place', location='$location', check_in='$check_in', 
                    check_out='$check_out', price='$price', status='$status', notes='$notes'
                WHERE booking_id=$booking_id";
        
        if (mysqli_query($conn, $sql)) {
            $success = "Booking updated successfully!";
            $_POST = array();
        } else {
            $error = "Error: " . mysqli_error($conn);
        }
    }
}

// Handle DELETE - Remove booking
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'delete') {
    $booking_id = $_POST["booking_id"] ?? 0;
    
    if ($booking_id > 0) {
        $sql = "DELETE FROM bookings WHERE booking_id=$booking_id";
        if (mysqli_query($conn, $sql)) {
            $success = "Booking deleted successfully!";
        } else {
            $error = "Error: " . mysqli_error($conn);
        }
    } else {
        $error = "Invalid booking ID";
    }
}

// JSON API - Get all bookings
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'get_bookings') {
    header('Content-Type: application/json');
    $tourist_email = $_POST["tourist_email"] ?? '';
    
    if (!empty($tourist_email)) {
        $sql = "SELECT * FROM bookings WHERE tourist_email='$tourist_email' ORDER BY created_date DESC";
    } else {
        $sql = "SELECT * FROM bookings ORDER BY created_date DESC";
    }
    
    $result = mysqli_query($conn, $sql);
    $bookings = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $bookings[] = $row;
        }
    }
    echo json_encode(['success' => true, 'bookings' => $bookings]);
    exit;
}

// JSON API - Search bookings
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'search_bookings') {
    header('Content-Type: application/json');
    $searchTerm = $_POST["search"] ?? '';
    $tourist_email = $_POST["tourist_email"] ?? '';
    
    if (!empty($searchTerm)) {
        $sql = "SELECT * FROM bookings 
                WHERE (place LIKE '%$searchTerm%' OR location LIKE '%$searchTerm%')";
        
        if (!empty($tourist_email)) {
            $sql .= " AND tourist_email='$tourist_email'";
        }
        
        $sql .= " ORDER BY created_date DESC";
        
        $result = mysqli_query($conn, $sql);
        $bookings = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $bookings[] = $row;
            }
        }
        echo json_encode(['success' => true, 'bookings' => $bookings, 'count' => count($bookings)]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Search term required']);
    }
    exit;
}

// JSON API - Get booking statistics
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'get_stats') {
    header('Content-Type: application/json');
    $tourist_email = $_POST["tourist_email"] ?? '';
    
    if (!empty($tourist_email)) {
        $totalResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM bookings WHERE tourist_email='$tourist_email'");
        $confirmedResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM bookings WHERE tourist_email='$tourist_email' AND status='Confirmed'");
        $pendingResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM bookings WHERE tourist_email='$tourist_email' AND status='Pending'");
    } else {
        $totalResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM bookings");
        $confirmedResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM bookings WHERE status='Confirmed'");
        $pendingResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM bookings WHERE status='Pending'");
    }
    
    $totalRow = mysqli_fetch_assoc($totalResult);
    $confirmedRow = mysqli_fetch_assoc($confirmedResult);
    $pendingRow = mysqli_fetch_assoc($pendingResult);
    
    $stats = [
        'totalBookings' => $totalRow['total'],
        'confirmedBookings' => $confirmedRow['total'],
        'pendingBookings' => $pendingRow['total']
    ];
    
    echo json_encode(['success' => true, 'stats' => $stats]);
    exit;
}

mysqli_close($conn);
?>
