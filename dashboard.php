<?php
// Run the auth check.
require_once 'core/auth_check.php';

// If the script continues, the user is logged in.
$user_id = $_SESSION['user_id'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Boltflow</title>
    <style>
        /* Simple placeholder styles */
        body { font-family: sans-serif; padding: 2rem; }
        header { display: flex; justify-content: space-between; align-items: center; }
        nav a { margin-left: 1rem; }
    </style>
</head>
<body>

    <header>
        <h1>Welcome to Boltflow</h1>
        <nav>
            <span>User ID: <?php echo htmlspecialchars($user_id); ?></span>
            <a href="api/logout.php">Logout</a>
        </nav>
    </header>

    <main>
        <h2>Your Tasks</h2>
        <p>Task management features will go here.</p>
        </main>

    </body>
</html>