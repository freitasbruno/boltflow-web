<?php
require_once '../core/config.php';
require_once '../core/auth_check.php'; // Protects the endpoint [cite: 429]

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];
$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$item_id = $input['id'] ?? null;

if (empty($item_id)) {
    $response['message'] = 'Task ID is missing.';
    echo json_encode($response);
    exit;
}

try {
    // 1. VERIFY OWNERSHIP [cite: 430]
    // We must ensure the user owns this item before deleting.
    $sql_check = "SELECT id FROM items WHERE id = ? AND user_id = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$item_id, $user_id]);
    
    if ($stmt_check->fetch() === false) {
        throw new Exception('Task not found or permission denied.');
    }

    // 2. DELETE THE ITEM [cite: 431]
    $sql_delete = "DELETE FROM items WHERE id = ?";
    $stmt_delete = $pdo->prepare($sql_delete);
    
    if ($stmt_delete->execute([$item_id])) {
        $response['status'] = 'success';
        $response['message'] = 'Task deleted successfully.';
    } else {
        $response['message'] = 'Failed to delete task.';
    }

} catch (Exception $e) {
    $response['message'] = 'Failed to delete task: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>