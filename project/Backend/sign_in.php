<?php
session_start();

// Auto-create database and auth_users table
$conn = mysqli_connect("localhost", "root", "");
if (!$conn) die(json_encode(['success' => false, 'message' => 'Database connection failed']));

// Create database
$sql_db = "CREATE DATABASE IF NOT EXISTS testdb";
mysqli_query($conn, $sql_db);

// Select database
mysqli_select_db($conn, "testdb");

// Create auth_users table for authentication
$sql_table = "CREATE TABLE IF NOT EXISTS auth_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    userid VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    country VARCHAR(100),
    company VARCHAR(255),
    manager_license VARCHAR(100),
    startdate DATE,
    interests VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
mysqli_query($conn, $sql_table);

// Initialize demo users if table is empty
$check_demo = mysqli_query($conn, "SELECT COUNT(*) as count FROM auth_users");
$demo_count = mysqli_fetch_assoc($check_demo)['count'];

if ($demo_count == 0) {
    $demo_users = [
        "('John Doe', 'tourist@example.com', 'tourist_001', '" . password_hash('tourist123', PASSWORD_BCRYPT) . "', 'tourist', 'USA', '', '', '', 'sightseeing,adventure')",
        "('Jane Smith', 'manager@example.com', 'manager_001', '" . password_hash('manager123', PASSWORD_BCRYPT) . "', 'manager', 'UK', 'Adventure Tours Ltd', 'MGR-12345', '2025-02-15', '')"
    ];
    foreach ($demo_users as $user) {
        mysqli_query($conn, "INSERT INTO auth_users (fullname, email, userid, password, role, country, company, manager_license, startdate, interests) VALUES $user");
    }
}

$error = "";

// Handle sign-in POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"] ?? '');
    $password = $_POST["password"] ?? '';

    // Validation (matching sign_in.js logic)
    if (empty($email) || empty($password)) {
        $error = "Please enter email and password";
    } else {
        // Find user by email
        $sql = "SELECT * FROM auth_users WHERE email='" . mysqli_real_escape_string($conn, $email) . "'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) == 0) {
            $error = "Invalid email or password";
        } else {
            $user = mysqli_fetch_assoc($result);

            // Verify password
            if (!password_verify($password, $user['password'])) {
                $error = "Invalid email or password";
            } else {
                // Create session (matching sign_in.js logic)
                $_SESSION['userSession'] = [
                    'email' => $user['email'],
                    'fullname' => $user['fullname'],
                    'role' => $user['role'],
                    'userid' => $user['userid'],
                    'loginTime' => date('Y-m-d H:i:s')
                ];

                // Also store in cookie for persistence
                setcookie('userEmail', $user['email'], time() + (86400 * 30), "/");
                setcookie('userRole', $user['role'], time() + (86400 * 30), "/");

                // Store session data in JavaScript and redirect
                $sessionJson = json_encode($_SESSION['userSession']);
                echo "<script>
                    localStorage.setItem('userSession', '$sessionJson');
                    if ('{$user['role']}' === 'manager') {
                        window.location.href = '../Front-End/html/dashboard.html';
                    } else {
                        window.location.href = '../Front-End/html/tourist_dashboard.html';
                    }
                </script>";
                exit;
            }
        }
    }
}

mysqli_close($conn);
?>

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sign In</title>
  <link rel="stylesheet" href="../css/sign_in.css">
  <style>
      .alert { padding: 12px; margin-bottom: 15px; border-radius: 4px; }
      .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner container">
      <a class="logo" href="index.html">MyTravel</a>
      <nav class="main-nav" aria-label="Main">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="sign_up.php">Sign Up</a></li>
        </ul>
      </nav>
    </div>
  </header>  

  <main class="container signin-container">
    <section class="card signin-card">
      <div class="card-header">
        <h1>Welcome back</h1>
        <a class="signup-link" href="sign_up.php">Sign Up</a>
      </div>
      <p class="note">Sign in to continue to your account</p>

      <?php if ($error): ?>
          <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <form id="signin-form" method="POST" novalidate>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>">

        <label for="password">Password</label>
        <div class="password-field">
          <input id="password" name="password" type="password" placeholder="Your password" required minlength="6">
          <button type="button" class="btn toggle-pass" aria-label="Show password">Show</button>
        </div>

        <div class="inline space-between">
          <div class="checkbox"><input type="checkbox" id="remember"><label for="remember">Remember me</label></div>
          <a class="forgot" href="#">Forgot password?</a>
        </div>

        <div class="actions">
          <button class="btn primary" type="submit">Sign in</button>
          <button class="btn" type="button" onclick="location.href='sign_up.php'">Create account</button>
        </div>
      </form>

      <div class="demo-info" style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
        <p style="font-weight: bold; margin-bottom: 8px;">Demo Credentials (from database):</p>
        <p><strong>Tourist:</strong> tourist@example.com / tourist123</p>
        <p><strong>Tour Manager:</strong> manager@example.com / manager123</p>
      </div>
    </section>
  </main>

  <script>
      // Password visibility toggle (matching sign_in.js logic)
      const toggleBtn = document.querySelector('.toggle-pass');
      const passwordField = document.getElementById('password');

      if (toggleBtn && passwordField) {
          toggleBtn.addEventListener('click', function(e) {
              e.preventDefault();
              if (passwordField.type === 'password') {
                  passwordField.type = 'text';
                  this.textContent = 'Hide';
              } else {
                  passwordField.type = 'password';
                  this.textContent = 'Show';
              }
          });
      }
  </script>

</body>
</html>
