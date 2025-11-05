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
$tag_id = $input['id'] ?? null;

if (empty($tag_id)) {
    $response['message'] = 'Tag ID is missing.';
    echo json_encode($response);
    exit;
}

try {
    // Delete the tag
    // We also check user_id to ensure the user owns this tag
    $sql_delete = "DELETE FROM tags WHERE id = ? AND user_id = ?";
    $stmt_delete = $pdo->prepare($sql_delete);
    $stmt_delete->execute([$tag_id, $user_id]);

    if ($stmt_delete->rowCount() > 0) {
        $response['status'] = 'success';
        $response['message'] = 'Tag deleted successfully.';
    } else {
        $response['message'] = 'Tag not found or you do not own it.';
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>