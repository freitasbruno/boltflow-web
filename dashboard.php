<?php
// Run the auth check.
require_once 'core/auth_check.php';

// If the script continues, the user is logged in.
$user_id = $_SESSION['user_id'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Boltflow</title>
    
    <link rel="stylesheet" href="dashboard.css">

    <style>
        body { font-family: sans-serif; padding: 2rem; }
        header { display: flex; justify-content: space-between; align-items: center; }
        nav a, nav button { margin-left: 1rem; }
    </style>
</head>
<body>

    <header>
        <h1>Welcome to Boltflow</h1>
        <nav>
            <span>User ID: <?php echo htmlspecialchars($user_id); ?></span>
            
            <button id="manage-tags-btn" class="btn-secondary">Manage Tags</button>
            
            <a href="api/logout.php">Logout</a>
        </nav>
    </header>

    <main>
        <h2>Your Tasks</h2>
        <p>Task management features will go here.</p>
    </main>

    <div id="tag-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="tag-modal-title" style="display: none;">
        <div class="modal-content">
            <header class="modal-header">
                <h3 id="tag-modal-title">Manage Tags</h3>
                <button id="close-tag-modal" class="modal-close" aria-label="Close modal">&times;</button>
            </header>
            
            <div class="modal-body">
                <form id="create-tag-form" class="tag-form">
                    <h4>Create New Tag</h4>
                    <div class="create-tag-controls">
                        <div class="form-group">
                            <input type="text" id="new-tag-name" required>
                        </div>
                        <button type="submit" class="btn">Create</button>
                    </div>
                    <div id="create-tag-message" class="form-message" aria-live="polite"></div>
                </form>
                
                <hr>
                
                <h4>Existing Tags</h4>
                <div id="tag-list" class="tag-list">
                    <p>Loading tags...</p>
                </div>
                <div id="edit-tag-message" class="form-message" aria-live="polite"></div>
            </div>
        </div>
    </div>
    <script src="dashboard.js" defer></script>
</body>
</html>