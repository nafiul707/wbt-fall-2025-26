<?php
header('Content-Type: application/json');
session_start();

$conn = mysqli_connect("localhost", "root", "");
if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

$sql_db = "CREATE DATABASE IF NOT EXISTS testdb";
mysqli_query($conn, $sql_db);
mysqli_select_db($conn, "testdb");

$sql_table = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    department VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
mysqli_query($conn, $sql_table);

$action = isset($_POST['action']) ? trim($_POST['action']) : (isset($_GET['action']) ? trim($_GET['action']) : '');

// SIGN IN
if ($action == 'signin') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        exit;
    }
    
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        
        if ($user['password'] === $password) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['fullname'] = $user['name'];
            $_SESSION['logged_in'] = true;
            
            echo json_encode(['success' => true, 'message' => 'Sign in successful']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    mysqli_stmt_close($stmt);
}

// SIGN UP
elseif ($action == 'signup') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }
    
    $checkEmail = "SELECT id FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $checkEmail);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
    } else {
        $sql = "INSERT INTO users (name, email, password, phone, department) VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        $phone = '';
        $department = 'General';
        mysqli_stmt_bind_param($stmt, "sssss", $name, $email, $password, $phone, $department);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Account created!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error creating account']);
        }
    }
    mysqli_stmt_close($stmt);
}

// Check session for dashboard
elseif ($action == 'check_session') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
    } else {
        echo json_encode(['success' => true]);
    }
}

// GET USERS
elseif ($action == 'get_users') {
    if (!isset($_SESSION['logged_in'])) {
        echo json_encode([]);
        exit;
    }
    
    $sql = "SELECT * FROM users ORDER BY created_date DESC";
    $result = mysqli_query($conn, $sql);
    $users = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
    
    echo json_encode($users);
}

// CREATE USER
elseif ($action == 'create_user') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $department = isset($_POST['department']) ? trim($_POST['department']) : '';
    
    if (empty($name) || empty($email) || empty($phone) || empty($department)) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }
    
    $checkEmail = "SELECT id FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $checkEmail);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
    } else {
        $sql = "INSERT INTO users (name, email, phone, department, password) VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        $password = '123456';
        mysqli_stmt_bind_param($stmt, "sssss", $name, $email, $phone, $department, $password);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'User created!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error creating user']);
        }
    }
    mysqli_stmt_close($stmt);
}

// UPDATE USER
elseif ($action == 'update_user') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $department = isset($_POST['department']) ? trim($_POST['department']) : '';
    
    if ($id == 0 || empty($name) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }
    
    $sql = "UPDATE users SET name = ?, email = ?, phone = ?, department = ? WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssi", $name, $email, $phone, $department, $id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'User updated!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating user']);
    }
    mysqli_stmt_close($stmt);
}

// DELETE USER
elseif ($action == 'delete_user') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    
    if ($id == 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }
    
    $sql = "DELETE FROM users WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'User deleted!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting user']);
    }
    mysqli_stmt_close($stmt);
}

// SEARCH USERS
elseif ($action == 'search_users') {
    $searchTerm = isset($_POST['searchTerm']) ? trim($_POST['searchTerm']) : '';
    $searchPattern = '%' . $searchTerm . '%';
    
    $sql = "SELECT * FROM users WHERE name LIKE ? OR email LIKE ? OR department LIKE ? ORDER BY created_date DESC";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sss", $searchPattern, $searchPattern, $searchPattern);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
    echo json_encode($users);
    mysqli_stmt_close($stmt);
}

// GET PROFILE
elseif ($action == 'get_profile') {
    if (isset($_SESSION['logged_in'])) {
        echo json_encode([
            'success' => true,
            'fullname' => $_SESSION['fullname'] ?? 'User',
            'email' => $_SESSION['email'] ?? ''
        ]);
    } else {
        echo json_encode(['success' => false]);
    }
}

// LOGOUT
elseif ($action == 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}

mysqli_close($conn);
?>
