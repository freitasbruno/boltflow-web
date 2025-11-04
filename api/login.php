<?php
// 1. Include the database connection
// We need to go 'up' one directory to find the core folder.
require_once '../core/config.php';

// 2. Start the session
// This must be called before any output.
session_start();

// Set the content type header to JSON
header('Content-Type: application/json');

// Initialize response array
$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];

// 3. Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// 4. Read and decode the JSON input
$input = json_decode(file_get_contents('php://input'), true);

// 5. Server-side validation
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$errors = [];

if (empty($email)) {
    $errors['email'] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if (empty($password)) {
    $errors['password'] = 'Password is required.';
}

if (!empty($errors)) {
    $response['message'] = 'Validation failed.';
    $response['errors'] = $errors;
    echo json_encode($response);
    exit;
}

try {
    // 6. Find the user by email using a PREPARED STATEMENT
    $sql_check = "SELECT id, password_hash FROM users WHERE email = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$email]);
    
    $user = $stmt_check->fetch();

    if ($user) {
        // 7. User found, verify the password
        // CRITICAL: Use password_verify()
        if (password_verify($password, $user['password_hash'])) {
            
            // 8. Password is correct! Create the session.
            // CRITICAL: Regenerate session ID to prevent session fixation
            session_regenerate_id(true);
            
            // Store user's ID in the session
            $_SESSION['user_id'] = $user['id'];
            
            // Success
            $response['status'] = 'success';
            $response['message'] = 'Login successful! Redirecting...';
            // Send the redirect URL to the frontend
            $response['redirect'] = '../dashboard.php'; 

        } else {
            // Invalid password
            $response['message'] = 'Invalid email or password.';
        }
    } else {
        // No user found with that email
        // We use the same message to prevent user enumeration
        $response['message'] = 'Invalid email or password.';
    }

} catch (PDOException $e) {
    // Handle database errors
    $response['message'] = 'Database error: ' . $e->getMessage();
    // In production, you would log this error and show a generic message.
}

// 9. Send the JSON response
echo json_encode($response);
exit;

?>