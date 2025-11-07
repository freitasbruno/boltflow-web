// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Modal Elements (Tag) ---
    const tagModal = document.getElementById('tag-modal');
    const openModalBtn = document.getElementById('manage-tags-btn');
    const closeModalBtn = document.getElementById('close-tag-modal');

    // --- Form Elements (Tag) ---
    const createTagForm = document.getElementById('create-tag-form');
    const newTagNameInput = document.getElementById('new-tag-name');
    const createTagMessage = document.getElementById('create-tag-message');
    
    // --- Tag List Elements ---
    const tagListContainer = document.getElementById('tag-list');
    const editTagMessage = document.getElementById('edit-tag-message');
    
    // --- Task Modal Elements (REFACTORED) ---
    const taskModal = document.getElementById('task-modal');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const openDetailedTaskBtn = document.getElementById('open-detailed-task-btn');
    const taskForm = document.getElementById('task-form');
    const taskModalTagList = document.getElementById('task-modal-tag-list');
    const taskModalMessage = document.getElementById('task-modal-message');
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskModalSubmitBtn = document.getElementById('task-modal-submit-btn');

    // --- Quick Task Form (NEW) ---
    const quickTaskForm = document.getElementById('quick-task-form');
    const quickTaskTitleInput = document.getElementById('quick-task-title');
    const quickTaskMessage = document.getElementById('quick-task-message');
    
    // --- Task List & Filter Elements ---
    const taskListContainer = document.getElementById('task-list-container');
    const filterForm = document.getElementById('filter-form');
    const filterStatus = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');
    const filterTag = document.getElementById('filter-tag');
    const paginationContainer = document.getElementById('pagination-container');

    // --- Store current filters ---
    let currentFilters = {
        status: '',
        priority: '',
        tag_id: '',
        page: 1
    };

    // =================================================================
    // --- TAG MODAL LOGIC (Unchanged) ---
    // =================================================================

    // --- Reset the modal state ---
    function resetTagModal() {
        newTagNameInput.value = '';
        showMessage(createTagMessage, '', 'success');
        showMessage(editTagMessage, '', 'success');
        loadTags();
    }

    // --- Show/Hide Modal ---
    openModalBtn.addEventListener('click', () => {
        tagModal.style.display = 'flex';
        loadTags(); 
    });

    closeModalBtn.addEventListener('click', () => {
        tagModal.style.display = 'none';
        resetTagModal();
    });

    window.addEventListener('click', (event) => {
        if (event.target == tagModal) {
            tagModal.style.display = 'none';
            resetTagModal();
        }
    });

    // --- 1. LOAD TAGS (READ) ---
    async function loadTags() {
        tagListContainer.innerHTML = '<p>Loading tags...</p>';
        try {
            const response = await fetch('api/get_tags.php');
            const data = await response.json();

            if (data.status === 'success') {
                renderTagList(data.tags);
            } else {
                tagListContainer.innerHTML = `<p class="error">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tags:', error);
            tagListContainer.innerHTML = '<p class="error">Failed to load tags.</p>';
        }
    }

    function renderTagList(tags) {
        tagListContainer.innerHTML = '';
        if (tags.length === 0) {
            tagListContainer.innerHTML = '<p>No tags created yet.</p>';
            return;
        }

        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.setAttribute('data-tag-id', tag.id);
            const tagName = escapeHTML(tag.name);

            tagItem.innerHTML = `
                <input type="text" class="tag-name-input" value="${tagName}" readonly>
                <div class="tag-item-actions">
                    <button class="btn-secondary btn-edit">Edit</button>
                    <button class="btn-danger btn-delete">Delete</button>
                </div>
            `;
            tagListContainer.appendChild(tagItem);
        });
    }

    // --- 2. CREATE TAG ---
    createTagForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const tagName = newTagNameInput.value.trim();
        showMessage(createTagMessage, '');

        if (!tagName) {
            showMessage(createTagMessage, 'Tag name cannot be empty.', 'error');
            return;
        }

        try {
            const response = await fetch('api/create_tag.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tagName })
            });
            const data = await response.json();

            if (data.status === 'success') {
                newTagNameInput.value = ''; 
                loadTags();
            } else {
                showMessage(createTagMessage, data.message, 'error');
            }
        } catch (error) {
            console.error('Error creating tag:', error);
            showMessage(createTagMessage, 'Failed to create tag.', 'error');
        }
    });

    // --- 3. UPDATE & DELETE (Event Delegation) ---
    tagListContainer.addEventListener('click', async (event) => {
        const target = event.target;
        const tagItem = target.closest('.tag-item');
        if (!tagItem) return;
        
        const tagId = tagItem.dataset.tagId;
        const input = tagItem.querySelector('.tag-name-input');
        
        if (target.classList.contains('btn-edit')) {
            if (target.textContent === 'Edit') {
                input.removeAttribute('readonly');
                input.focus();
                target.textContent = 'Save';
                target.classList.remove('btn-secondary');
                target.classList.add('btn');
            } else {
                const newName = input.value.trim();
                if (!newName) {
                    showMessage(editTagMessage, 'Tag name cannot be empty.', 'error');
                    return;
                }
                await updateTag(tagId, newName, target);
            }
        }

        if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this tag? This cannot be undone.')) {
                await deleteTag(tagId, tagItem);
            }
        }
    });

    async function updateTag(id, name, saveButton) {
        showMessage(editTagMessage, '');
        try {
            const response = await fetch('api/update_tag.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, name: name })
            });
            const data = await response.json();

            if (data.status === 'success') {
                const input = saveButton.closest('.tag-item').querySelector('.tag-name-input');
                input.setAttribute('readonly', true);
                saveButton.textContent = 'Edit';
                saveButton.classList.remove('btn');
                saveButton.classList.add('btn-secondary');
            } else {
                showMessage(editTagMessage, data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating tag:', error);
            showMessage(editTagMessage, 'Failed to update tag.', 'error');
        }
    }
    
    async function deleteTag(id, tagItemElement) {
        showMessage(editTagMessage, '');
        try {
            const response = await fetch('api/delete_tag.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();

            if (data.status === 'success') {
                tagItemElement.remove();
            } else {
                showMessage(editTagMessage, data.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            showMessage(editTagMessage, 'Failed to delete tag.', 'error');
        }
    }

    // =================================================================
    // --- TASK LOGIC (REFACTORED) ---
    // =================================================================

    // --- Load Tags into Forms on Page Load ---
    async function loadTagsForForms() {
        if (!taskModalTagList && !filterTag) return; 
        
        try {
            const response = await fetch('api/get_tags.php');
            const data = await response.json();

            if (data.status === 'success') {
                if (filterTag) filterTag.innerHTML = '<option value="">All Tags</option>';
                if (taskModalTagList) taskModalTagList.innerHTML = ''; 

                if (data.tags.length === 0) {
                    if (taskModalTagList) taskModalTagList.innerHTML = '<p>No tags created yet.</p>';
                    return;
                }
                
                data.tags.forEach(tag => {
                    const tagName = escapeHTML(tag.name);
                    
                    // 1. Populate Filter Dropdown
                    if (filterTag) {
                        const filterOption = document.createElement('option');
                        filterOption.value = tag.id;
                        filterOption.textContent = tagName;
                        filterTag.appendChild(filterOption);
                    }

                    // 2. Populate Task Modal (Checkboxes)
                    if (taskModalTagList) {
                        const tagOption = document.createElement('label');
                        tagOption.className = 'tag-option';
                        tagOption.innerHTML = `<input type="checkbox" name="task-tags" value="${tag.id}"> ${tagName}`;
                        taskModalTagList.appendChild(tagOption);
                    }
                });

            } else {
                if (taskModalTagList) taskModalTagList.innerHTML = `<p class="error">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tags for forms:', error);
            if (taskModalTagList) taskModalTagList.innerHTML = '<p class="error">Failed to load tags.</p>';
        }
    }
    
    // --- Handle Quick Task Form Submission (NEW) ---
    if (quickTaskForm) {
        quickTaskForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(quickTaskMessage, '', 'success');
            const title = quickTaskTitleInput.value.trim();

            if (!title) {
                showMessage(quickTaskMessage, 'Title is required.', 'error');
                return;
            }

            // Only send the title. api/create_task.php will use defaults.
            const taskData = { title: title };

            try {
                const response = await fetch('api/create_task.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    showMessage(quickTaskMessage, data.message, 'success');
                    quickTaskForm.reset(); // Clear the input
                    loadTasks(); // Refresh the task list
                    
                    // Hide success message after 2 seconds
                    setTimeout(() => showMessage(quickTaskMessage, '', 'success'), 2000);

                } else {
                    showMessage(quickTaskMessage, data.message, 'error');
                }
            } catch (error) {
                console.error('Error creating task:', error);
                showMessage(quickTaskMessage, 'A network error occurred.', 'error');
            }
        });
    }
    
    // --- LOAD TASKS (READ) (Unchanged) ---
    async function loadTasks() {
        const params = new URLSearchParams(currentFilters).toString();
        taskListContainer.innerHTML = '<p>Loading tasks...</p>';
        
        try {
            const response = await fetch(`api/get_tasks.php?${params}`);
            const data = await response.json();

            if (data.status === 'success') {
                renderTaskList(data.tasks);
                renderPagination(data.pagination);
            } else {
                taskListContainer.innerHTML = `<p class="error">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            taskListContainer.innerHTML = '<p class="error">Failed to load tasks.</p>';
        }
    }
    
    // --- Render Task List HTML (Unchanged) ---
    function renderTaskList(tasks) {
        taskListContainer.innerHTML = ''; 
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p>No tasks found. Try creating one!</p>';
            return;
        }

        const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.setAttribute('data-task-id', task.id);

            const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : 'N/A';
            const safeTitle = escapeHTML(task.title);
            const tagsHTML = task.tag_names ? 
                task.tag_names.split(', ').map(tag => `<span class="task-tag">${escapeHTML(tag)}</span>`).join('') : '';

            taskItem.innerHTML = `
            <div class="task-item-details">
                <h4>${safeTitle}</h4>
                    <div class="task-item-meta">
                        <p>Status: <span>${task.status}</span></p>
                        <p>Priority: <span>${priorityMap[task.priority]}</span></p>
                        <p>Due: <span>${dueDate}</span></p>
                    </div>
                    <div class="task-item-tags">${tagsHTML}</div>
                </div>
                <div class="task-item-actions">
                    <button class="btn-secondary btn-edit-task">Edit</button>
                    <button class="btn-danger btn-delete-task">Delete</button>
                </div>
            `;
            taskListContainer.appendChild(taskItem);
        });
    }

    // --- Render Pagination (Unchanged) ---
    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        if (pagination.total_pages <= 1) return;

        for (let i = 1; i <= pagination.total_pages; i++) {
            if (i === pagination.page) {
                const pageSpan = document.createElement('span');
                pageSpan.className = 'current';
                pageSpan.textContent = i;
                paginationContainer.appendChild(pageSpan);
            } else {
                const pageLink = document.createElement('a');
                pageLink.href = '#';
                pageLink.textContent = i;
                pageLink.setAttribute('data-page', i);
                paginationContainer.appendChild(pageLink);
            }
        }
    }

    // --- Task Modal & List Click Handlers (REFACTORED) ---

    // 1. Open Modal Buttons
    openDetailedTaskBtn.addEventListener('click', () => {
        openTaskModal('create');
    });

    taskListContainer.addEventListener('click', (event) => {
        const editButton = event.target.closest('.btn-edit-task');
        const deleteButton = event.target.closest('.btn-delete-task');
        
        if (editButton) {
            const taskItem = event.target.closest('.task-item');
            const taskId = taskItem.dataset.taskId;
            openTaskModal('edit', taskId);
        }

        if (deleteButton) {
            const taskItem = event.target.closest('.task-item');
            const taskId = taskItem.dataset.taskId;
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
            }
        }
    });

    // 2. Close Modal
    closeTaskModalBtn.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    // 3. Submit Task Modal (Handles BOTH Create and Edit)
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage(taskModalMessage, '', 'success');

        // 1. Get mode and all form values
        const mode = taskForm.dataset.mode;
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title-input').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const due_date = document.getElementById('task-due-date').value;

        // 2. Get selected tag IDs
        const selectedTags = [];
        const checkboxes = taskModalTagList.querySelectorAll('input[name="task-tags"]:checked');
        checkboxes.forEach(cb => {
            selectedTags.push(cb.value);
        });

        // 3. Client-side validation
        if (!title) {
            showMessage(taskModalMessage, 'Title is required.', 'error');
            return;
        }

        // 4. Prepare data
        const taskData = { id, title, description, status, priority, due_date, tag_ids: selectedTags };
        
        // 5. Determine API endpoint and payload
        let apiUrl = '';
        let payload = {};

        if (mode === 'create') {
            apiUrl = 'api/create_task.php';
            // Don't send the 'id' when creating
            payload = { title, description, status, priority, due_date, tag_ids: selectedTags };
        } else {
            apiUrl = 'api/update_task.php';
            // Send the 'id' when updating
            payload = taskData; 
        }

        // 6. Send to backend
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.status === 'success') {
                taskModal.style.display = 'none';
                loadTasks(); // Reload the main task list
            } else {
                showMessage(taskModalMessage, data.message, 'error');
            }
        } catch (error) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} task:`, error);
            showMessage(taskModalMessage, 'A network error occurred.', 'error');
        }
    });

    // --- Helper function to open and populate the task modal (REFACTORED) ---
    async function openTaskModal(mode, taskId = null) {
        showMessage(taskModalMessage, '', 'success');
        taskForm.reset(); // Clear the form
        
        // 1. Reset tag checkboxes
        const checkboxes = taskModalTagList.querySelectorAll('input[name="task-tags"]');
        checkboxes.forEach(cb => cb.checked = false);

        if (mode === 'create') {
            // --- CREATE MODE ---
            taskForm.dataset.mode = 'create';
            taskModalTitle.textContent = 'Create New Task';
            taskModalSubmitBtn.textContent = 'Create Task';
            
            // Set defaults
            document.getElementById('task-id').value = '';
            document.getElementById('task-status').value = 'Pending';
            document.getElementById('task-priority').value = '2'; // Medium
            document.getElementById('task-due-date').value = '';

            taskModal.style.display = 'flex';

        } else if (mode === 'edit' && taskId) {
            // --- EDIT MODE ---
            taskForm.dataset.mode = 'edit';
            taskModalTitle.textContent = 'Edit Task';
            taskModalSubmitBtn.textContent = 'Save Changes';

            try {
                const response = await fetch(`api/get_task_details.php?id=${taskId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    const { task, tag_ids } = data;

                    // 1. Populate form fields
                    document.getElementById('task-id').value = taskId;
                    document.getElementById('task-title-input').value = task.title;
                    document.getElementById('task-description').value = task.description;
                    document.getElementById('task-status').value = task.status;
                    document.getElementById('task-priority').value = task.priority;
                    document.getElementById('task-due-date').value = task.due_date;

                    // 2. Populate checkboxes
                    checkboxes.forEach(cb => {
                        cb.checked = tag_ids.includes(cb.value);
                    });

                    // 3. Show the modal
                    taskModal.style.display = 'flex';

                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error fetching task details:', error);
                alert('A network error occurred.');
            }
        }
    }

    // --- Helper function to delete a task (Unchanged) ---
    async function deleteTask(taskId) {
        try {
            const response = await fetch('api/delete_task.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId })
            });
            const data = await response.json();
            if (data.status === 'success') {
                loadTasks();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('A network error occurred.');
        }
    }

    // --- Filters & Pagination Listeners (Unchanged) ---
    if (filterForm) {
        filterForm.addEventListener('change', () => {
            currentFilters.status = filterStatus.value;
            currentFilters.priority = filterPriority.value;
            currentFilters.tag_id = filterTag.value;
            currentFilters.page = 1; 
            loadTasks(); 
        });
    }
    
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (event) => {
            event.preventDefault();
            if (event.target.tagName === 'A' && event.target.dataset.page) {
                currentFilters.page = parseInt(event.target.dataset.page, 10);
                loadTasks(); 
            }
        });
    }

    // --- Initial Load ---
    loadTasks();
    loadTagsForForms();
    
    // --- Helper function for messages ---
    function showMessage(element, message, type = 'error') {
        if (!element) return; // Guard clause
        if (message) {
            element.textContent = message;
            element.className = `form-message ${type}`;
        } else {
            element.textContent = '';
            element.className = 'form-message';
        }
    }

    // --- Helper function to escape HTML ---
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    }

    // --- Helper class for screen-reader only text (NEW) ---
    // We need to add this CSS to `dashboard.css` for the "visually-hidden" class
    const style = document.createElement('style');
    style.innerHTML = `
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: -1px;
            padding: 0;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }
        .quick-task-form {
            display: flex;
            gap: var(--spacing-sm);
        }
        .quick-task-form .form-group {
            flex-grow: 1;
            margin-bottom: 0;
        }
    `;
    document.head.appendChild(style);
});