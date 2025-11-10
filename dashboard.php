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
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    
    <style>
        /* Keep body color for contrast */
        body { background-color: #f8f9fa; }
        /* Custom styles for tag items in modal */
        .tag-item-input {
            border: 1px solid transparent;
            border-radius: .375rem;
            padding: .375rem .75rem;
        }
        .tag-item-input:focus {
            outline: 0;
            border: 1px solid #86b7fe;
            box-shadow: 0 0 0 0.25rem rgb(13 110 253 / 25%);
        }
        .tag-checkbox-list {
            max-height: 150px;
            overflow-y: auto;
            border: 1px solid var(--bs-border-color);
            border-radius: var(--bs-border-radius);
            padding: 1rem;
        }
    </style>
</head>
<body>

    <header class="p-3 mb-3 border-bottom bg-white">
        <div class="container">
            <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                <a href="#" class="h4 d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none me-lg-auto">
                    Boltflow
                </a>

                <div class="ms-auto d-flex align-items-center">
                    <span class="text-muted me-3">User ID: <?php echo htmlspecialchars($user_id); ?></span>
                    <button id="manage-tags-btn" class="btn btn-outline-secondary me-2">Manage Tags</button>
                    <a href="api/logout.php" class="btn btn-danger">Logout</a>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="row g-4">
            <div class="col-lg-4">
                
                <section class="card shadow-sm mb-4">
                    <div class="card-header">
                        <h3 class="h5 mb-0">Add a Task</h3>
                    </div>
                    <div class="card-body">
                        <form id="quick-task-form">
                            <label for="quick-task-title" class="visually-hidden">Task Title</label>
                            <div class="input-group">
                                <input type="text" id="quick-task-title" class="form-control" placeholder="e.g., Buy groceries..." required>
                                <button type="submit" class="btn btn-primary">Add</button>
                            </div>
                        </form>
                        <button type="button" id="open-detailed-task-btn" class="btn btn-outline-primary w-100 mt-2">Add Full Task</button>
                        <div id="quick-task-message" class="mt-3" aria-live="polite"></div>
                    </div>
                </section>
                
                <section class="card shadow-sm">
                    <div class="card-header">
                        <h3 class="h5 mb-0">Filters</h3>
                    </div>
                    <div class="card-body">
                        <form id="filter-form">
                            <div class="mb-3">
                                <label for="filter-status" class="form-label">Status</label>
                                <select id="filter-status" class="form-select">
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="filter-priority" class="form-label">Priority</label>
                                <select id="filter-priority" class="form-select">
                                    <option value="">All Priorities</option>
                                    <option value="1">Low</option>
                                    <option value="2">Medium</option>
                                    <option value="3">High</option>
                                </select>
                            </div>
                            <div>
                                <label for="filter-tag" class="form-label">Tag</label>
                                <select id="filter-tag" class="form-select">
                                    <option value="">All Tags</option>
                                    </select>
                            </div>
                        </form>
                    </div>
                </section>
            </div>

            <div class="col-lg-8">
                <section class="card shadow-sm">
                    <div class="card-header">
                        <h2 class="h4 mb-0">Your Tasks</h2>
                    </div>
                    <div class="card-body">
                        <div id="task-list-container">
                            <p>Loading tasks...</p>
                        </div>
                        <nav id="pagination-container" class="d-flex justify-content-center mt-4" aria-label="Task pagination"></nav>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <div id="tag-modal" class="modal" tabindex="-1" style="display: none;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tag-modal-title">Manage Tags</h5>
                    <button type="button" id="close-tag-modal" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="create-tag-form">
                        <h6>Create New Tag</h6>
                        <div class="input-group">
                            <input type="text" id="new-tag-name" class="form-control" placeholder="New tag name" required>
                            <button type="submit" class="btn btn-primary">Create</button>
                        </div>
                        <div id="create-tag-message" class="mt-2" aria-live="polite"></div>
                    </form>
                    
                    <hr>
                    
                    <h6>Existing Tags</h6>
                    <div id="tag-list" class="list-group list-group-flush">
                        <p>Loading tags...</p>
                    </div>
                    <div id="edit-tag-message" class="mt-2" aria-live="polite"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="task-modal" class="modal" tabindex="-1" style="display: none;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="task-modal-title">Create Task</h5>
                    <button type="button" id="close-task-modal" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="task-form">
                        <input type="hidden" id="task-id">
                        <div id="task-modal-message" class="mb-3" aria-live="polite"></div>
                        
                        <div class="mb-3">
                            <label for="task-title-input" class="form-label">Title (Required)</label>
                            <input type="text" id="task-title-input" class="form-control" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="task-description" class="form-label">Description</label>
                            <textarea id="task-description" class="form-control" rows="3"></textarea>
                        </div>

                        <div class="row g-3">
                            <div class="col-md-4">
                                <label for="task-status" class="form-label">Status</label>
                                <select id="task-status" class="form-select">
                                    <option value="Pending" selected>Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="task-priority" class="form-label">Priority</label>
                                <select id="task-priority" class="form-select">
                                    <option value="1">Low</option>
                                    <option value="2" selected>Medium</option>
                                    <option value="3">High</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="task-due-date" class="form-label">Due Date</label>
                                <input type="datetime-local" id="task-due-date" class="form-control">
                            </div>
                        </div>

                        <div class="mt-3">
                            <label class="form-label">Tags</label>
                            <div id="task-modal-tag-list" class="tag-checkbox-list">
                                <p>Loading tags...</p>
                            </div>
                        </div>
                        
                        <hr>
                        <button type="submit" id="task-modal-submit-btn" class="btn btn-primary w-100">Create Task</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="dashboard.js" defer></script>
    
</body>
</html>