<?php
require_once '../core/config.php';
require_once '../core/auth_check.php'; // Protects the endpoint

// This script only accepts GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$response = ['status' => 'success', 'tags' => []];

try {
    // Fetch all tags for the logged-in user, ordering by name
    $sql = "SELECT id, name FROM tags WHERE user_id = ? ORDER BY name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    
    $response['tags'] = $stmt->fetchAll();

} catch (PDOException $e) {
    $response['status'] = 'error';
    $response['message'] = 'Database error: ' . $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
exit;
?>