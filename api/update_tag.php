<?php
require_once '../core/config.php';
require_once '../core/auth_check.php'; // Protects the endpoint

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];
$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Using POST for simplicity
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$tag_id = $input['id'] ?? null;
$name = $input['name'] ?? '';

// Server-side validation
if (empty($name)) {
    $response['message'] = 'Tag name cannot be empty.';
    echo json_encode($response);
    exit;
}
if (empty($tag_id)) {
    $response['message'] = 'Tag ID is missing.';
    echo json_encode($response);
    exit;
}

try {
    // Check for duplicate name (on a DIFFERENT tag)
    $sql_check = "SELECT id FROM tags WHERE user_id = ? AND name = ? AND id != ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$user_id, $name, $tag_id]);
    if ($stmt_check->fetch()) {
        $response['message'] = 'Another tag with this name already exists.';
        echo json_encode($response);
        exit;
    }

    // Update the tag
    // We also check user_id to ensure the user owns this tag
    $sql_update = "UPDATE tags SET name = ? WHERE id = ? AND user_id = ?";
    $stmt_update = $pdo->prepare($sql_update);
    $stmt_update->execute([$name, $tag_id, $user_id]);

    if ($stmt_update->rowCount() > 0) {
        $response['status'] = 'success';
        $response['message'] = 'Tag updated successfully.';
    } else {
        $response['message'] = 'Tag not found or no changes made.';
    }

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        $response['message'] = 'A tag with this name already exists.';
    } else {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
}

echo json_encode($response);
exit;
?>