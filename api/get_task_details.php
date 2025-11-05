<?php
require_once '../core/config.php';
require_once '../core/auth_check.php'; // Protects the endpoint

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'Task not found.'];
$user_id = $_SESSION['user_id'];

// 1. Get task ID from the query string
$item_id = $_GET['id'] ?? null;

if (empty($item_id)) {
    $response['message'] = 'Task ID is missing.';
    echo json_encode($response);
    exit;
}

try {
    // 2. Fetch the main task data (from items and tasks tables)
    // We join and check the user_id to ensure ownership
    $sql_task = "SELECT i.title, i.description, t.status, t.priority, t.due_date
                 FROM items i
                 JOIN tasks t ON i.id = t.item_id
                 WHERE i.id = ? AND i.user_id = ?";
    
    $stmt_task = $pdo->prepare($sql_task);
    $stmt_task->execute([$item_id, $user_id]);
    $task = $stmt_task->fetch();

    if ($task) {
        // 3. Fetch the associated tag IDs
        $sql_tags = "SELECT tag_id FROM item_tag WHERE item_id = ?";
        $stmt_tags = $pdo->prepare($sql_tags);
        $stmt_tags->execute([$item_id]);
        
        // Use fetchAll with PDO::FETCH_COLUMN to get a simple array of IDs
        $tag_ids = $stmt_tags->fetchAll(PDO::FETCH_COLUMN);

        // 4. Format due_date for datetime-local input
        // The input requires a 'T' separator, e.g., 2025-11-05T14:30
        if ($task['due_date']) {
            $date = new DateTime($task['due_date']);
            $task['due_date'] = $date->format('Y-m-d\TH:i');
        }

        $response['status'] = 'success';
        $response['task'] = $task;
        $response['tag_ids'] = $tag_ids;
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>