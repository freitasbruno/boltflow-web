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
    
    // --- Task Modal Elements ---
    const taskModal = document.getElementById('task-modal');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const openDetailedTaskBtn = document.getElementById('open-detailed-task-btn');
    const taskForm = document.getElementById('task-form');
    const taskModalTagList = document.getElementById('task-modal-tag-list');
    const taskModalMessage = document.getElementById('task-modal-message');
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskModalSubmitBtn = document.getElementById('task-modal-submit-btn');

    // --- Quick Task Form ---
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
    // --- TAG MODAL LOGIC ---
    // =================================================================

    function resetTagModal() {
        newTagNameInput.value = '';
        showMessage(createTagMessage, '', 'success');
        showMessage(editTagMessage, '', 'success');
        loadTags();
    }

    openModalBtn.addEventListener('click', () => {
        tagModal.style.display = 'block'; // Use 'block' for Bootstrap CSS-only modal
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

    async function loadTags() {
        tagListContainer.innerHTML = '<p>Loading tags...</p>';
        try {
            const response = await fetch('api/get_tags.php');
            const data = await response.json();

            if (data.status === 'success') {
                renderTagList(data.tags);
            } else {
                tagListContainer.innerHTML = `<p class="text-danger">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tags:', error);
            tagListContainer.innerHTML = '<p class="text-danger">Failed to load tags.</p>';
        }
    }

    // --- UPDATED: renderTagList to use Bootstrap classes ---
    function renderTagList(tags) {
        tagListContainer.innerHTML = '';
        if (tags.length === 0) {
            tagListContainer.innerHTML = '<p>No tags created yet.</p>';
            return;
        }

        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            // Use Bootstrap list-group classes
            tagItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            tagItem.setAttribute('data-tag-id', tag.id);
            const tagName = escapeHTML(tag.name);

            tagItem.innerHTML = `
                <input type="text" class="tag-item-input flex-grow-1" value="${tagName}" readonly>
                <div class="tag-item-actions ms-2">
                    <button class="btn btn-outline-secondary btn-sm btn-edit">Edit</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete">Delete</button>
                </div>
            `;
            tagListContainer.appendChild(tagItem);
        });
    }

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

    tagListContainer.addEventListener('click', async (event) => {
        const target = event.target;
        const tagItem = target.closest('.list-group-item');
        if (!tagItem) return;
        
        const tagId = tagItem.dataset.tagId;
        const input = tagItem.querySelector('.tag-item-input');
        
        if (target.classList.contains('btn-edit')) {
            if (target.textContent === 'Edit') {
                input.removeAttribute('readonly');
                input.focus();
                target.textContent = 'Save';
                target.classList.remove('btn-outline-secondary');
                target.classList.add('btn-primary'); // Make it blue
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
                const input = saveButton.closest('.list-group-item').querySelector('.tag-item-input');
                input.setAttribute('readonly', true);
                saveButton.textContent = 'Edit';
                saveButton.classList.remove('btn-primary');
                saveButton.classList.add('btn-outline-secondary');
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
    // --- TASK LOGIC ---
    // =================================================================

    // --- UPDATED: loadTagsForForms to use Bootstrap classes ---
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
                        const tagOption = document.createElement('div');
                        // Use Bootstrap form-check
                        tagOption.className = 'form-check';
                        tagOption.innerHTML = `
                            <input class="form-check-input" type="checkbox" name="task-tags" value="${tag.id}" id="tag-check-${tag.id}">
                            <label class="form-check-label" for="tag-check-${tag.id}">${tagName}</label>
                        `;
                        taskModalTagList.appendChild(tagOption);
                    }
                });

            } else {
                if (taskModalTagList) taskModalTagList.innerHTML = `<p class="text-danger">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tags for forms:', error);
            if (taskModalTagList) taskModalTagList.innerHTML = '<p class="text-danger">Failed to load tags.</p>';
        }
    }
    
    if (quickTaskForm) {
        quickTaskForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(quickTaskMessage, '', 'success');
            const title = quickTaskTitleInput.value.trim();

            if (!title) {
                showMessage(quickTaskMessage, 'Title is required.', 'error');
                return;
            }
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
                    quickTaskForm.reset();
                    loadTasks(); 
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
                taskListContainer.innerHTML = `<p class="text-danger">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            taskListContainer.innerHTML = '<p class="text-danger">Failed to load tasks.</p>';
        }
    }
    
    // --- UPDATED: renderTaskList to use Bootstrap classes ---
    function renderTaskList(tasks) {
        taskListContainer.innerHTML = ''; 
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p>No tasks found. Try creating one!</p>';
            return;
        }

        const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
        const priorityBadge = { 1: 'bg-secondary', 2: 'bg-info', 3: 'bg-warning' };
        const statusBadge = { 
            'Pending': 'bg-secondary', 
            'In Progress': 'bg-primary', 
            'Done': 'bg-success' 
        };

        const listGroup = document.createElement('div');
        listGroup.className = 'list-group';
        
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'list-group-item';
            taskItem.setAttribute('data-task-id', task.id);

            const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : 'N/A';
            const safeTitle = escapeHTML(task.title);
            const tagsHTML = task.tag_names ? 
                task.tag_names.split(', ').map(tag => `<span class="badge bg-light text-dark me-1">${escapeHTML(tag)}</span>`).join('') : '';

            taskItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${safeTitle}</h5>
                <small class="text-muted">Due: ${dueDate}</small>
            </div>
            <div class="d-flex gap-3 mb-2 small text-muted">
                <span>Status: <span class="badge ${statusBadge[task.status]}">${task.status}</span></span>
                <span>Priority: <span class="badge ${priorityBadge[task.priority]}">${priorityMap[task.priority]}</span></span>
            </div>
            <div class="mb-2">${tagsHTML}</div>
            <div class="task-item-actions">
                <button class="btn btn-outline-secondary btn-sm btn-edit-task">Edit</button>
                <button class="btn btn-outline-danger btn-sm btn-delete-task">Delete</button>
            </div>
            `;
            listGroup.appendChild(taskItem);
        });
        taskListContainer.appendChild(listGroup);
    }

    // --- UPDATED: renderPagination to use Bootstrap classes ---
    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        if (pagination.total_pages <= 1) return;

        const nav = document.createElement('ul');
        nav.className = 'pagination';

        for (let i = 1; i <= pagination.total_pages; i++) {
            const li = document.createElement('li');
            li.className = 'page-item';
            if (i === pagination.page) {
                li.classList.add('active');
            }

            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = i;
            a.setAttribute('data-page', i);
            
            li.appendChild(a);
            nav.appendChild(li);
        }
        paginationContainer.appendChild(nav);
    }

    // --- Task Modal & List Click Handlers ---

    openDetailedTaskBtn.addEventListener('click', () => {
        openTaskModal('create');
    });

    taskListContainer.addEventListener('click', (event) => {
        const editButton = event.target.closest('.btn-edit-task');
        const deleteButton = event.target.closest('.btn-delete-task');
        
        if (editButton) {
            const taskItem = event.target.closest('.list-group-item');
            const taskId = taskItem.dataset.taskId;
            openTaskModal('edit', taskId);
        }

        if (deleteButton) {
            const taskItem = event.target.closest('.list-group-item');
            const taskId = taskItem.dataset.taskId;
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
            }
        }
    });

    closeTaskModalBtn.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });
    
    // Close modal if user clicks outside of the modal-dialog
    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
    });

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage(taskModalMessage, '', 'success');

        const mode = taskForm.dataset.mode;
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title-input').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const due_date = document.getElementById('task-due-date').value;

        const selectedTags = [];
        // Use new checkbox name
        const checkboxes = taskModalTagList.querySelectorAll('input[name="task-tags"]:checked');
        checkboxes.forEach(cb => {
            selectedTags.push(cb.value);
        });

        if (!title) {
            showMessage(taskModalMessage, 'Title is required.', 'error');
            return;
        }
        
        const taskData = { id, title, description, status, priority, due_date, tag_ids: selectedTags };
        let apiUrl = '';
        let payload = {};

        if (mode === 'create') {
            apiUrl = 'api/create_task.php';
            payload = { title, description, status, priority, due_date, tag_ids: selectedTags };
        } else {
            apiUrl = 'api/update_task.php';
            payload = taskData; 
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.status === 'success') {
                taskModal.style.display = 'none';
                loadTasks(); 
            } else {
                showMessage(taskModalMessage, data.message, 'error');
            }
        } catch (error) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} task:`, error);
            showMessage(taskModalMessage, 'A network error occurred.', 'error');
        }
    });

    async function openTaskModal(mode, taskId = null) {
        showMessage(taskModalMessage, '', 'success');
        taskForm.reset(); 
        
        const checkboxes = taskModalTagList.querySelectorAll('input[name="task-tags"]');
        checkboxes.forEach(cb => cb.checked = false);

        if (mode === 'create') {
            taskForm.dataset.mode = 'create';
            taskModalTitle.textContent = 'Create New Task';
            taskModalSubmitBtn.textContent = 'Create Task';
            
            document.getElementById('task-id').value = '';
            document.getElementById('task-status').value = 'Pending';
            document.getElementById('task-priority').value = '2'; // Medium
            document.getElementById('task-due-date').value = '';

            taskModal.style.display = 'block'; // Use 'block'

        } else if (mode === 'edit' && taskId) {
            taskForm.dataset.mode = 'edit';
            taskModalTitle.textContent = 'Edit Task';
            taskModalSubmitBtn.textContent = 'Save Changes';

            try {
                const response = await fetch(`api/get_task_details.php?id=${taskId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    const { task, tag_ids } = data;

                    document.getElementById('task-id').value = taskId;
                    document.getElementById('task-title-input').value = task.title;
                    document.getElementById('task-description').value = task.description;
                    document.getElementById('task-status').value = task.status;
                    document.getElementById('task-priority').value = task.priority;
                    document.getElementById('task-due-date').value = task.due_date;

                    checkboxes.forEach(cb => {
                        cb.checked = tag_ids.includes(cb.value);
                    });

                    taskModal.style.display = 'block'; // Use 'block'

                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error fetching task details:', error);
                alert('A network error occurred.');
            }
        }
    }

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

    // --- Filters & Pagination Listeners ---
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
            const pageLink = event.target.closest('.page-link');
            if (pageLink && pageLink.dataset.page) {
                currentFilters.page = parseInt(pageLink.dataset.page, 10);
                loadTasks(); 
            }
        });
    }

    // --- Initial Load ---
    loadTasks();
    loadTagsForForms();
    
    // --- UPDATED: showMessage to use Bootstrap classes ---
    function showMessage(element, message, type = 'error') {
        if (!element) return;
        if (message) {
            element.textContent = message;
            // Use Bootstrap alert classes
            element.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
        } else {
            element.textContent = '';
            element.className = ''; // Remove all classes
        }
    }

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
});