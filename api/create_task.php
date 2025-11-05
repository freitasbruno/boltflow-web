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
$title = $input['title'] ?? '';
$description = $input['description'] ?? null;
$status = $input['status'] ?? 'Pending';
$priority = $input['priority'] ?? 1;
// Handle empty string as NULL for optional fields
$due_date = !empty($input['due_date']) ? $input['due_date'] : null;
$tag_ids = $input['tag_ids'] ?? []; // Expect an array of tag IDs

if (empty($title)) {
    $response['message'] = 'Title is required.';
    echo json_encode($response);
    exit;
}

// Ensure tag_ids is an array
if (!is_array($tag_ids)) {
    $response['message'] = 'Invalid tags format.';
    echo json_encode($response);
    exit;
}


// 2. --- DATABASE TRANSACTION ---
try {
    // Start the transaction
    $pdo->beginTransaction();

    // --- Step A: Insert into 'items' table ---
    $sql_item = "INSERT INTO items (user_id, `type`, title, description) 
                 VALUES (?, 'task', ?, ?)";
    $stmt_item = $pdo->prepare($sql_item);
    $stmt_item->execute([$user_id, $title, $description]);
    
    // Get the ID of the new item
    $item_id = $pdo->lastInsertId();

    // --- Step B: Insert into 'tasks' table ---
    $sql_task = "INSERT INTO tasks (item_id, status, priority, due_date) 
                 VALUES (?, ?, ?, ?)";
    $stmt_task = $pdo->prepare($sql_task);
    $stmt_task->execute([$item_id, $status, $priority, $due_date]);

    // --- Step C: Insert into 'item_tag' pivot table ---
    if (!empty($tag_ids)) {
        // Prepare the statement once
        $sql_pivot = "INSERT INTO item_tag (item_id, tag_id) VALUES (?, ?)";
        $stmt_pivot = $pdo->prepare($sql_pivot);
        
        foreach ($tag_ids as $tag_id) {
            // We should ideally also verify the user owns the tag,
            // but for the MVP, we'll just link it.
            $stmt_pivot->execute([$item_id, $tag_id]);
        }
    }

    // --- Step D: Commit the transaction ---
    // If all queries were successful, commit the changes.
    $pdo->commit();
    
    $response['status'] = 'success';
    $response['message'] = 'Task created successfully.';
    // We'll send back the new task ID for future use (like adding to the list)
    $response['new_task_id'] = $item_id;

} catch (Exception $e) {
    // --- Step E: Rollback on failure ---
    // If any query failed, roll back all changes.
    $pdo->rollBack();
    
    $response['message'] = 'Failed to create task: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>