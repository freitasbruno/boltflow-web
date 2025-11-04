<?php
// 1. Start the session
session_start();

// 2. Unset all session variables
$_SESSION = array();

// 3. Destroy the session
session_destroy();

// 4. Redirect to login page with a success message
// We use a query parameter to tell login.html to show a message.
header("Location: ../auth/login.html?status=logged_out");
exit;
?>