<?php
require_once '../core/config.php';
require_once '../core/auth_check.php'; // Protects the endpoint

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];
$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$name = $input['name'] ?? '';

// Server-side validation
if (empty($name)) {
    $response['message'] = 'Tag name cannot be empty.';
    echo json_encode($response);
    exit;
}

try {
    // Check for duplicate tag name (per user)
    // This relies on the UNIQUE key in the database [cite: 855]
    $sql_check = "SELECT id FROM tags WHERE user_id = ? AND name = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$user_id, $name]);

    if ($stmt_check->fetch()) {
        $response['message'] = 'A tag with this name already exists.';
        echo json_encode($response);
        exit;
    }

    // Insert the new tag
    $sql_insert = "INSERT INTO tags (user_id, name) VALUES (?, ?)";
    $stmt_insert = $pdo->prepare($sql_insert);
    
    if ($stmt_insert->execute([$user_id, $name])) {
        $response['status'] = 'success';
        $response['message'] = 'Tag created successfully.';
        $response['new_tag'] = [
            'id' => $pdo->lastInsertId(),
            'name' => $name
        ];
    } else {
        $response['message'] = 'Failed to create tag.';
    }

} catch (PDOException $e) {
    // Check if it's a unique constraint violation
    if ($e->getCode() == 23000) {
        $response['message'] = 'A tag with this name already exists.';
    } else {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
}

echo json_encode($response);
exit;
?>