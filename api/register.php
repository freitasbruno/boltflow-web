<?php
// We must require the config.php file to connect to the database
require_once '../core/config.php';

// Set the content type header to JSON
header('Content-Type: application/json');

// 1. Initialize response array
$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];

// 2. Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// 3. Read and decode the JSON input
$input = json_decode(file_get_contents('php://input'), true);

// 4. Server-side validation
$name = $input['name'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$password_confirm = $input['password_confirm'] ?? '';
$errors = [];

if (empty($name)) {
    $errors['name'] = 'Name is required.';
}
if (empty($email)) {
    $errors['email'] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if (empty($password)) {
    $errors['password'] = 'Password is required.';
}
if ($password !== $password_confirm) {
    $errors['password_confirm'] = 'Passwords do not match.';
}

if (!empty($errors)) {
    $response['message'] = 'Validation failed.';
    $response['errors'] = $errors;
    echo json_encode($response);
    exit;
}

try {
    // 5. Check if email already exists using a PREPARED STATEMENT
    $sql_check = "SELECT id FROM users WHERE email = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$email]);
    
    if ($stmt_check->fetch()) {
        $response['message'] = 'An account with this email already exists.';
        echo json_encode($response);
        exit;
    }

    // 6. Hash the password
    // CRITICAL: Always use password_hash()
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 6.2 Email to lowercase
    $email = strtolower($email);

    // 7. Insert the new user using a PREPARED STATEMENT
    $sql_insert = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";
    $stmt_insert = $pdo->prepare($sql_insert);
    
    if ($stmt_insert->execute([$name, $email, $password_hash])) {
        // Success
        $response['status'] = 'success';
        $response['message'] = 'Registration successful. Please log in.';
    } else {
        $response['message'] = 'Failed to create account. Please try again.';
    }

} catch (PDOException $e) {
    // Handle database errors
    $response['message'] = 'Database error: ' . $e->getMessage();
    // In production, you would log this error and show a generic message.
}

// 8. Send the JSON response
echo json_encode($response);
exit;

?>