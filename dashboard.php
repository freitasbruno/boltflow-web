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

<main class="dashboard-main">
        <section class="new-task-section">
            <h3>Create New Task</h3>
            <form id="new-task-form">
                <div id="new-task-message" class="form-message" aria-live="polite"></div>
                
                <div class="form-group">
                    <label for="task-title">Title (Required)</label>
                    <input type="text" id="task-title" required>
                </div>
                
                <div class="form-group">
                    <label for="task-description">Description</label>
                    <textarea id="task-description" rows="3"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="task-status">Status</label>
                        <select id="task-status">
                            <option value="Pending" selected>Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="task-priority">Priority</label>
                        <select id="task-priority">
                            <option value="1">Low</option>
                            <option value="2" selected>Medium</option>
                            <option value="3">High</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="task-due-date">Due Date</label>
                        <input type="datetime-local" id="task-due-date">
                    </div>
                </div>

                <div class="form-group">
                    <label>Tags</label>
                    <div id="task-tag-list" class="tag-checkbox-list">
                        <p>Loading tags...</p>
                    </div>
                </div>
                
                <button type="submit" class="btn">Create Task</button>
            </form>
        </section>

        <hr class="section-divider">

        <section class="task-list-section">
            <div class="task-list-header">
                <h2>Your Tasks</h2>
                
                <form id="filter-form" class="filter-controls">
                    <div class="form-group">
                        <label for="filter-status">Status</label>
                        <select id="filter-status">
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-priority">Priority</label>
                        <select id="filter-priority">
                            <option value="">All Priorities</option>
                            <option value="1">Low</option>
                            <option value="2">Medium</option>
                            <option value="3">High</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-tag">Tag</label>
                        <select id="filter-tag">
                            <option value="">All Tags</option>
                        </select>
                    </div>
                </form>
            </div>
            
            <div id="task-list-container">
                <p>Loading tasks...</p>
            </div>
            <nav id="pagination-container" class="pagination" aria-label="Task pagination"></nav>
        </section>
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

    <div id="edit-task-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-task-title" style="display: none;">
        <div class="modal-content">
            <header class="modal-header">
                <h3 id="edit-task-title">Edit Task</h3>
                <button id="close-edit-task-modal" class="modal-close" aria-label="Close modal">&times;</button>
            </header>
            
            <div class="modal-body">
                <form id="edit-task-form">
                    <input type="hidden" id="edit-task-id">
                    
                    <div id="edit-task-message" class="form-message" aria-live="polite"></div>
                    
                    <div class="form-group">
                        <label for="edit-task-title">Title (Required)</label>
                        <input type="text" id="edit-task-title-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-task-description">Description</label>
                        <textarea id="edit-task-description" rows="3"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-task-status">Status</label>
                            <select id="edit-task-status">
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-priority">Priority</label>
                            <select id="edit-task-priority">
                                <option value="1">Low</option>
                                <option value="2">Medium</option>
                                <option value="3">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-due-date">Due Date</label>
                            <input type="datetime-local" id="edit-task-due-date">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Tags</label>
                        <div id="edit-task-tag-list" class="tag-checkbox-list">
                            <p>Loading tags...</p>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn">Save Changes</button>
                </form>
            </div>
        </div>
    </div>

    <script src="dashboard.js" defer></script>
    
</body>
</html>