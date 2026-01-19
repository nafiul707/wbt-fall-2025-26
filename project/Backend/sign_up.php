<?php
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
$success = "";

// Handle sign-up POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = trim($_POST["fullname"] ?? '');
    $email = trim($_POST["email"] ?? '');
    $country = $_POST["country"] ?? '';
    $userid = trim($_POST["userid"] ?? '');
    $password = $_POST["password"] ?? '';
    $confirm = $_POST["confirm"] ?? '';
    $role = $_POST["role"] ?? 'tourist';
    $company = trim($_POST["company"] ?? '');
    $managerid = trim($_POST["managerid"] ?? '');
    $startdate = $_POST["startdate"] ?? '';
    $interests = is_array($_POST["interest"] ?? []) ? implode(',', $_POST["interest"]) : '';

    // Validation (matching sign_up.js logic)
    if (empty($fullname) || empty($email) || empty($country) || empty($userid) || empty($password) || empty($confirm)) {
        $error = "Please fill all required fields";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format";
    } elseif (strlen($password) < 6) {
        $error = "Password must be at least 6 characters";
    } elseif ($password !== $confirm) {
        $error = "Passwords do not match";
    } elseif ($role === 'manager' && (empty($company) || empty($managerid))) {
        $error = "Company and Manager License ID are required for tour managers";
    } else {
        // Check if email already exists
        $sql_check_email = "SELECT * FROM auth_users WHERE email='" . mysqli_real_escape_string($conn, $email) . "'";
        $result_email = mysqli_query($conn, $sql_check_email);

        if (mysqli_num_rows($result_email) > 0) {
            $error = "Email already registered";
        } else {
            // Check if userid already exists
            $sql_check_userid = "SELECT * FROM auth_users WHERE userid='" . mysqli_real_escape_string($conn, $userid) . "'";
            $result_userid = mysqli_query($conn, $sql_check_userid);

            if (mysqli_num_rows($result_userid) > 0) {
                $error = "User ID already taken";
            } else {
                // Hash password
                $hashed_password = password_hash($password, PASSWORD_BCRYPT);

                // Insert new user
                $sql_insert = "INSERT INTO auth_users (fullname, email, userid, password, role, country, company, manager_license, startdate, interests) 
                              VALUES (
                                '" . mysqli_real_escape_string($conn, $fullname) . "',
                                '" . mysqli_real_escape_string($conn, $email) . "',
                                '" . mysqli_real_escape_string($conn, $userid) . "',
                                '" . $hashed_password . "',
                                '" . mysqli_real_escape_string($conn, $role) . "',
                                '" . mysqli_real_escape_string($conn, $country) . "',
                                '" . mysqli_real_escape_string($conn, $company) . "',
                                '" . mysqli_real_escape_string($conn, $managerid) . "',
                                '" . mysqli_real_escape_string($conn, $startdate) . "',
                                '" . mysqli_real_escape_string($conn, $interests) . "'
                              )";

                if (mysqli_query($conn, $sql_insert)) {
                    $success = "Registration successful! Redirecting to sign in...";
                    // Redirect to sign in after 2 seconds
                    echo "<script>
                        setTimeout(function() {
                            window.location.href = 'sign_in.php';
                        }, 2000);
                    </script>";
                } else {
                    $error = "Error registering user: " . mysqli_error($conn);
                }
            }
        }
    }
}

mysqli_close($conn);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Tourist / Manager Sign Up</title>
    <link rel="stylesheet" href="../css/sign_up.css">
    <style>
        .alert { padding: 12px; margin-bottom: 15px; border-radius: 4px; }
        .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .hidden { display: none !important; }
    </style>
</head>
<body>
    <header class="site-header">
        <div class="container header-inner">
            <a class="logo" href="index.html">MyTravel</a>
            <nav class="main-nav" aria-label="Main">
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="sign_in.php">Sign In</a></li>
                    <li><a href="sign_up.php">Sign Up</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <h1>Tourist / Tour Manager Sign Up</h1>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>

        <form class="signup-form" id="signup-form" method="POST" novalidate>
            <fieldset class="card">
                <legend>Personal Info</legend>

                <div class="role-group">
                    <input type="radio" id="tourist" name="role" value="tourist" checked>
                    <label for="tourist">Tourist</label>

                    <input type="radio" id="manager" name="role" value="manager">
                    <label for="manager">Tour Manager</label>
                </div>

                <label>
                    Full name
                    <input type="text" name="fullname" required placeholder="Jane Doe" value="<?php echo isset($fullname) ? htmlspecialchars($fullname) : ''; ?>">
                </label>

                <label>
                    Email
                    <input type="email" name="email" required placeholder="you@example.com" value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>">
                </label>

                <label>
                    Country
                    <select name="country" required>
                        <option value="">Select a country</option>
                        <option value="Bangladesh" <?php echo isset($country) && $country === 'Bangladesh' ? 'selected' : ''; ?>>Bangladesh</option>
                        <option value="United States" <?php echo isset($country) && $country === 'United States' ? 'selected' : ''; ?>>United States</option>
                        <option value="United Kingdom" <?php echo isset($country) && $country === 'United Kingdom' ? 'selected' : ''; ?>>United Kingdom</option>
                        <option value="India" <?php echo isset($country) && $country === 'India' ? 'selected' : ''; ?>>India</option>
                        <option value="Other" <?php echo isset($country) && $country === 'Other' ? 'selected' : ''; ?>>Other</option>
                    </select>
                </label>

                <div id="manager-fields" class="hidden">
                    <label>
                        Company
                        <input type="text" name="company" placeholder="Company name" value="<?php echo isset($company) ? htmlspecialchars($company) : ''; ?>">
                    </label>
                    <label>
                        Manager ID / License
                        <input type="text" name="managerid" placeholder="ID or license" value="<?php echo isset($managerid) ? htmlspecialchars($managerid) : ''; ?>">
                    </label>
                </div>
            </fieldset>

            <fieldset class="card">
                <legend>Account / Sign Up</legend>

                <label>
                    User ID
                    <input type="text" name="userid" id="userid" required placeholder="Choose a unique ID" value="<?php echo isset($userid) ? htmlspecialchars($userid) : ''; ?>">
                </label>

                <label>
                    Password
                    <input type="password" name="password" required minlength="6" placeholder="Minimum 6 characters">
                </label>

                <label>
                    Confirm password
                    <input type="password" name="confirm" required minlength="6" placeholder="Re-enter password">
                </label>

                <p class="note">You'll use this User ID and password to sign in later.</p>
            </fieldset>

            <fieldset class="card">
                <legend>Travel Details</legend>
                <label class="inline">
                    Preferred start date
                    <input type="date" name="startdate" value="<?php echo isset($startdate) ? htmlspecialchars($startdate) : ''; ?>">
                </label>

                <div class="inline">
                    <span>Interests</span>
                    <label><input type="checkbox" name="interest" value="sightseeing"> Sightseeing</label>
                    <label><input type="checkbox" name="interest" value="adventure"> Adventure</label>
                    <label><input type="checkbox" name="interest" value="food"> Food</label>
                </div>
            </fieldset>

            <fieldset class="card actions">
                <label class="checkbox">
                    <input type="checkbox" id="terms" required> I agree to the <a href="#">terms & conditions</a>
                </label>

                <div class="buttons">
                    <button type="submit" class="btn primary">Sign Up</button>
                    <button type="reset" class="btn">Reset</button>
                </div>
            </fieldset>
        </form>
    </main>

    <footer class="site-footer">
        <div class="container">© 2025 MyTravel</div>
    </footer>

    <script>
        // Toggle manager fields based on role selection
        document.querySelectorAll('input[name="role"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const managerFields = document.getElementById('manager-fields');
                if (this.value === 'manager') {
                    managerFields.classList.remove('hidden');
                    document.querySelector('input[name="company"]').required = true;
                    document.querySelector('input[name="managerid"]').required = true;
                } else {
                    managerFields.classList.add('hidden');
                    document.querySelector('input[name="company"]').required = false;
                    document.querySelector('input[name="managerid"]').required = false;
                }
            });
        });

        // Initialize - hide manager fields by default
        document.addEventListener('DOMContentLoaded', function() {
            const managerFields = document.getElementById('manager-fields');
            if (managerFields) {
                managerFields.classList.add('hidden');
            }
        });
    </script>

</body>
</html>
