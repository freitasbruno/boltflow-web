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

// 1. --- VALIDATION ---
$item_id = $input['id'] ?? null;
$title = $input['title'] ?? '';
$description = $input['description'] ?? null;
$status = $input['status'] ?? 'Pending';
$priority = $input['priority'] ?? 1;
$due_date = !empty($input['due_date']) ? $input['due_date'] : null;
$tag_ids = $input['tag_ids'] ?? [];

if (empty($item_id)) {
    $response['message'] = 'Task ID is missing.';
    echo json_encode($response);
    exit;
}
if (empty($title)) {
    $response['message'] = 'Title is required.';
    echo json_encode($response);
    exit;
}
if (!is_array($tag_ids)) {
    $response['message'] = 'Invalid tags format.';
    echo json_encode($response);
    exit;
}

// 2. --- DATABASE TRANSACTION ---
try {
    $pdo->beginTransaction();

    // --- Step A: Update 'items' table ---
    // We MUST check the user_id here for security.
    $sql_check = "SELECT id FROM items WHERE id = ? AND user_id = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$item_id, $user_id]);
    
    if ($stmt_check->fetch() === false) {
        // If this fails, the user does not own the task.
        throw new Exception('Task not found or permission denied.');
    }
    
    // --- Step B: Update 'items' table ---
    $sql_item = "UPDATE items SET title = ?, description = ? WHERE id = ?";
    $stmt_item = $pdo->prepare($sql_item);
    $stmt_item->execute([$title, $description, $item_id]);
    

    // --- Step C: Update 'tasks' table ---
    $sql_task = "UPDATE tasks SET status = ?, priority = ?, due_date = ?
                 WHERE item_id = ?";
    $stmt_task = $pdo->prepare($sql_task);
    $stmt_task->execute([$status, $priority, $due_date, $item_id]);

    // --- Step D: Update 'item_tag' pivot table (Delete all, then re-insert) ---
    $sql_delete_tags = "DELETE FROM item_tag WHERE item_id = ?";
    $stmt_delete_tags = $pdo->prepare($sql_delete_tags);
    $stmt_delete_tags->execute([$item_id]);

    if (!empty($tag_ids)) {
        $sql_pivot = "INSERT INTO item_tag (item_id, tag_id) VALUES (?, ?)";
        $stmt_pivot = $pdo->prepare($sql_pivot);
        foreach ($tag_ids as $tag_id) {
            $stmt_pivot->execute([$item_id, $tag_id]);
        }
    }

    // --- Step E: Commit the transaction ---
    $pdo->commit();
    
    $response['status'] = 'success';
    $response['message'] = 'Task updated successfully.';

} catch (Exception $e) {
    $pdo->rollBack();
    $response['message'] = 'Failed to update task: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>