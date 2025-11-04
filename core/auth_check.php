<?php
// CRITICAL: This file must be 'required' at the top of any protected page.

// 1. Start the session
session_start();

// 2. Check if the user is logged in
// If the 'user_id' session variable is not set or is empty...
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    
    // 3. Redirect to the login page
    header("Location: auth/login.html");
    
    // 4. Stop script execution
    exit;
}

// If the script reaches this point, the user is authenticated.
?>