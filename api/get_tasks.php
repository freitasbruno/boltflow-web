<?php
require_once '../core/config.php';
require_once '../core/auth_check.php'; // Protects the endpoint

header('Content-Type: application/json');
$response = ['status' => 'success', 'tasks' => [], 'pagination' => []];
$user_id = $_SESSION['user_id'];

try {
    // --- 1. Get Filter Parameters (from $_GET) ---
    $status = $_GET['status'] ?? null;
    $priority = $_GET['priority'] ?? null;
    $tag_id = $_GET['tag_id'] ?? null;

    // --- 2. Pagination Parameters ---
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $page_size = 20; // Number of tasks per page
    $offset = ($page - 1) * $page_size;

    // --- 3. Build Dynamic SQL Query ---
    $params = [$user_id]; // Start params array with user_id
    
    // Base query joins items and tasks
    $sql_base = "FROM items i
                 JOIN tasks t ON i.id = t.item_id";
    
    // This will hold our dynamic WHERE clauses
    $where_clauses = ["i.user_id = ?"];

    // --- Dynamic Joins & Filters ---
    
    // Filter by Tag
    if (!empty($tag_id)) {
        // Add a join to the item_tag pivot table
        $sql_base .= " JOIN item_tag it ON i.id = it.item_id";
        $where_clauses[] = "it.tag_id = ?";
        $params[] = $tag_id;
    }

    // Filter by Status
    if (!empty($status)) {
        $where_clauses[] = "t.status = ?";
        $params[] = $status;
    }

    // Filter by Priority
    if (!empty($priority)) {
        $where_clauses[] = "t.priority = ?";
        $params[] = $priority;
    }

    // --- 4. Get Total Count for Pagination ---
    $sql_count = "SELECT COUNT(DISTINCT i.id) $sql_base WHERE " . implode(" AND ", $where_clauses);
    $stmt_count = $pdo->prepare($sql_count);
    $stmt_count->execute($params);
    $total_tasks = $stmt_count->fetchColumn();
    $total_pages = ceil($total_tasks / $page_size);

    // --- 5. Get Paginated Task Data ---
    // We select the main data and group by item ID to avoid duplicates
    $sql_data = "SELECT 
                    i.id, i.title, i.description, 
                    t.status, t.priority, t.due_date,
                    GROUP_CONCAT(tags.name SEPARATOR ', ') as tag_names
                 $sql_base
                 LEFT JOIN item_tag it_tags ON i.id = it_tags.item_id
                 LEFT JOIN tags ON it_tags.tag_id = tags.id
                 WHERE " . implode(" AND ", $where_clauses) . "
                 GROUP BY i.id
                 ORDER BY i.created_at DESC
                 LIMIT ? OFFSET ?";
    
    // Add pagination params to the array
    $params[] = $page_size;
    $params[] = $offset;

    $stmt_data = $pdo->prepare($sql_data);
    $stmt_data->execute($params);
    $response['tasks'] = $stmt_data->fetchAll();

    // --- 6. Set Pagination Response ---
    $response['pagination'] = [
        'page' => $page,
        'page_size' => $page_size,
        'total_tasks' => $total_tasks,
        'total_pages' => $total_pages
    ];

} catch (PDOException $e) {
    $response['status'] = 'error';
    $response['message'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
exit;
?>