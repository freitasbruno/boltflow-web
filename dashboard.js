// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Modal Elements ---
    const tagModal = document.getElementById('tag-modal');
    const openModalBtn = document.getElementById('manage-tags-btn');
    const closeModalBtn = document.getElementById('close-tag-modal');

    // --- Form Elements ---
    const createTagForm = document.getElementById('create-tag-form');
    const newTagNameInput = document.getElementById('new-tag-name');
    const createTagMessage = document.getElementById('create-tag-message');
    
    // --- Tag List Elements ---
    const tagListContainer = document.getElementById('tag-list');
    const editTagMessage = document.getElementById('edit-tag-message');
    
    // --- Edit Task Modal Elements ---
    const editTaskModal = document.getElementById('edit-task-modal');
    const closeEditTaskModalBtn = document.getElementById('close-edit-task-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskTagList = document.getElementById('edit-task-tag-list');
    const editTaskMessage = document.getElementById('edit-task-message');

    // --- Reset the modal state ---
    function resetTagModal() {
        // 1. Clear the "Create New Tag" input
        newTagNameInput.value = '';
        
        // 2. Clear any error messages
        showMessage(createTagMessage, '', 'success'); // Hides the element
        showMessage(editTagMessage, '', 'success'); // Hides the element

        // 3. Reload the tag list to reset any "Edit/Save" states
        loadTags();
    }

    // --- Show/Hide Modal ---
    openModalBtn.addEventListener('click', () => {
        tagModal.style.display = 'flex';
        loadTags(); // Load tags every time modal is opened
    });

    closeModalBtn.addEventListener('click', () => {
        tagModal.style.display = 'none';
        resetTagModal(); // Call reset function
    });

    // Close modal if user clicks outside of the modal-content
    window.addEventListener('click', (event) => {
        if (event.target == tagModal) {
            tagModal.style.display = 'none';
            resetTagModal(); // Call reset function
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

    // Helper function to display the list of tags
    function renderTagList(tags) {
        tagListContainer.innerHTML = ''; // Clear loading message
        if (tags.length === 0) {
            tagListContainer.innerHTML = '<p>No tags created yet.</p>';
            return;
        }

        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.setAttribute('data-tag-id', tag.id);

            // Using htmlspecialchars equivalent for JS
            const tagName = tag.name.replace(/[&<>"']/g, m => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m]));

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
        showMessage(createTagMessage, ''); // Clear previous message

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
                // MODIFICATION: No success message
                newTagNameInput.value = ''; // Clear input
                loadTags(); // Reload the tag list
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
        
        // --- UPDATE ---
        if (target.classList.contains('btn-edit')) {
            // Toggle edit/save state
            if (target.textContent === 'Edit') {
                input.removeAttribute('readonly');
                input.focus();
                target.textContent = 'Save';
                target.classList.remove('btn-secondary');
                target.classList.add('btn'); // Make it blue
            } else {
                // Save logic
                const newName = input.value.trim();
                if (!newName) {
                    showMessage(editTagMessage, 'Tag name cannot be empty.', 'error');
                    return;
                }
                await updateTag(tagId, newName, target);
            }
        }

        // --- DELETE ---
        if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this tag? This cannot be undone.')) {
                await deleteTag(tagId, tagItem);
            }
        }
    });

    async function updateTag(id, name, saveButton) {
        showMessage(editTagMessage, ''); // Clear message
        try {
            const response = await fetch('api/update_tag.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, name: name })
            });
            const data = await response.json();

            if (data.status === 'success') {
                // MODIFICATION: No success message
                // Reset button and input
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
        showMessage(editTagMessage, ''); // Clear message
        try {
            const response = await fetch('api/delete_tag.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();

            if (data.status === 'success') {
                // MODIFICATION: No success message
                tagItemElement.remove(); // Remove tag from the list
            } else {
                showMessage(editTagMessage, data.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            showMessage(editTagMessage, 'Failed to delete tag.', 'error');
        }
    }

    // --- Task Form Elements ---
    const newTaskForm = document.getElementById('new-task-form');
    const taskTagList = document.getElementById('task-tag-list');
    const newTaskMessage = document.getElementById('new-task-message');
    
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

    // --- Load Tags into the Task Form on Page Load ---
    async function loadTagsForForms() {
        // Add `editTaskTagList` to the check
        if (!taskTagList && !filterTag && !editTaskTagList) return; 
        
        try {
            // (Your existing fetch logic...)
            const response = await fetch('api/get_tags.php');
            const data = await response.json();

            if (data.status === 'success') {
                // (Your existing .innerHTML clears...)
                if (taskTagList) taskTagList.innerHTML = ''; 
                if (filterTag) filterTag.innerHTML = '<option value="">All Tags</option>';
                if (editTaskTagList) editTaskTagList.innerHTML = ''; // NEW

                if (data.tags.length === 0) {
                    if (taskTagList) taskTagList.innerHTML = '<p>No tags created yet.</p>';
                    if (editTaskTagList) editTaskTagList.innerHTML = '<p>No tags created yet.</p>'; // NEW
                    return;
                }
                
                data.tags.forEach(tag => {
                    const tagName = tag.name.replace(/[&<>"']/g, m => ({'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#39;'}[m]));
                    
                    // 1. Populate Create Task Form (Checkboxes)
                    if (taskTagList) {
                        // (Your existing code for this)
                        const tagOption = document.createElement('label');
                        tagOption.className = 'tag-option';
                        tagOption.innerHTML = `<input type="checkbox" value="${tag.id}"> ${tagName}`;
                        taskTagList.appendChild(tagOption);
                    }
                    
                    // 2. Populate Filter Dropdown
                    if (filterTag) {
                        // (Your existing code for this)
                        const filterOption = document.createElement('option');
                        filterOption.value = tag.id;
                        filterOption.textContent = tagName;
                        filterTag.appendChild(filterOption);
                    }

                    // 3. Populate Edit Task Form (Checkboxes) - NEW
                    if (editTaskTagList) {
                        const tagOption = document.createElement('label');
                        tagOption.className = 'tag-option';
                        // We add a name attribute to group them for querying
                        tagOption.innerHTML = `<input type="checkbox" name="edit-tags" value="${tag.id}"> ${tagName}`;
                        editTaskTagList.appendChild(tagOption);
                    }
                });

            } else {
                // (Your existing error handling...)
                if (taskTagList) taskTagList.innerHTML = `<p class="error">${data.message}</p>`;
                if (editTaskTagList) editTaskTagList.innerHTML = `<p class="error">${data.message}</p>`; // NEW
            }
        } catch (error) {
            // (Your existing catch block...)
            console.error('Error loading tags for forms:', error);
            if (taskTagList) taskTagList.innerHTML = '<p class="error">Failed to load tags.</p>';
            if (editTaskTagList) editTaskTagList.innerHTML = '<p class="error">Failed to load tags.</p>'; // NEW
        }
    }
    
    // Call the function on page load
    loadTagsForForms();

    // --- Handle New Task Form Submission ---
    if (newTaskForm) {
        newTaskForm.addEventListener('submit', async (event) => {
            // ... (Your existing form submission logic)
            event.preventDefault();
            showMessage(newTaskMessage, '', 'success');
            
            const title = document.getElementById('task-title').value.trim();
            // ... (get description, status, etc.)
            const description = document.getElementById('task-description').value.trim();
            const status = document.getElementById('task-status').value;
            const priority = document.getElementById('task-priority').value;
            const due_date = document.getElementById('task-due-date').value;
            const selectedTags = [];
            const checkboxes = taskTagList.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(cb => { selectedTags.push(cb.value); });
            if (!title) {
                showMessage(newTaskMessage, 'Title is required.', 'error');
                return;
            }
            const taskData = {
                title: title,
                description: description,
                status: status,
                priority: priority,
                due_date: due_date,
                tag_ids: selectedTags
            };

            try {
                const response = await fetch('api/create_task.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    showMessage(newTaskMessage, data.message, 'success');
                    newTaskForm.reset(); 
                    checkboxes.forEach(cb => cb.checked = false);
                    
                    // --- NEW: Refresh the task list ---
                    loadTasks(); 
                    
                } else {
                    showMessage(newTaskMessage, data.message, 'error');
                }
            } catch (error) {
                console.error('Error creating task:', error);
                showMessage(newTaskMessage, 'A network error occurred.', 'error');
            }
        });
    }

    // --- LOAD TASKS (READ) ---
    async function loadTasks() {
        // Build query string from current filters
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
    
    // --- Helper to render task list HTML ---
    function renderTaskList(tasks) {
        taskListContainer.innerHTML = ''; // Clear
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p>No tasks found. Try creating one!</p>';
            return;
        }

        const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.setAttribute('data-task-id', task.id);

            // Format data
            const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : 'N/A';
            const tagsHTML = task.tag_names ? 
                task.tag_names.split(', ').map(tag => `<span class="task-tag">${tag}</span>`).join('') : '';

            taskItem.innerHTML = `
                <div class="task-item-details">
                    <h4>${task.title}</h4>
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

    // --- Helper to render pagination controls ---
    function renderPagination(pagination) {
        paginationContainer.innerHTML = ''; // Clear
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

    // --- Event Listeners for Edit Modal ---

    // 1. Open Modal (Event Delegation on task list)
    taskListContainer.addEventListener('click', (event) => {
        const editButton = event.target.closest('.btn-edit-task');
        if (editButton) {
            const taskItem = event.target.closest('.task-item');
            const taskId = taskItem.dataset.taskId;
            openEditTaskModal(taskId);
        }
    });

    // 2. Close Modal
    closeEditTaskModalBtn.addEventListener('click', () => {
        editTaskModal.style.display = 'none';
    });

    // 3. Submit Edit Form
    editTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage(editTaskMessage, '', 'success'); // Clear message

        // 1. Get all form values
        const id = document.getElementById('edit-task-id').value;
        const title = document.getElementById('edit-task-title-input').value.trim();
        const description = document.getElementById('edit-task-description').value.trim();
        const status = document.getElementById('edit-task-status').value;
        const priority = document.getElementById('edit-task-priority').value;
        const due_date = document.getElementById('edit-task-due-date').value;

        // 2. Get selected tag IDs
        const selectedTags = [];
        const checkboxes = editTaskTagList.querySelectorAll('input[name="edit-tags"]:checked');
        checkboxes.forEach(cb => {
            selectedTags.push(cb.value);
        });

        // 3. Client-side validation
        if (!title) {
            showMessage(editTaskMessage, 'Title is required.', 'error');
            return;
        }

        // 4. Prepare data
        const taskData = { id, title, description, status, priority, due_date, tag_ids: selectedTags };

        // 5. Send to backend
        try {
            const response = await fetch('api/update_task.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            const data = await response.json();

            if (data.status === 'success') {
                // Success! Close modal and refresh the task list
                editTaskModal.style.display = 'none';
                loadTasks(); // Reload the main task list
            } else {
                showMessage(editTaskMessage, data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            showMessage(editTaskMessage, 'A network error occurred.', 'error');
        }
    });

    // --- NEW: Helper function to open and populate the edit modal ---
    async function openEditTaskModal(taskId) {
        showMessage(editTaskMessage, '', 'success'); // Clear old messages
        
        try {
            const response = await fetch(`api/get_task_details.php?id=${taskId}`);
            const data = await response.json();

            if (data.status === 'success') {
                const { task, tag_ids } = data;

                // 1. Populate form fields
                document.getElementById('edit-task-id').value = taskId;
                document.getElementById('edit-task-title-input').value = task.title;
                document.getElementById('edit-task-description').value = task.description;
                document.getElementById('edit-task-status').value = task.status;
                document.getElementById('edit-task-priority').value = task.priority;
                document.getElementById('edit-task-due-date').value = task.due_date;

                // 2. Populate checkboxes
                const checkboxes = editTaskTagList.querySelectorAll('input[name="edit-tags"]');
                checkboxes.forEach(cb => {
                    // Check the box if its value is in the tag_ids array
                    cb.checked = tag_ids.includes(cb.value);
                });

                // 3. Show the modal
                editTaskModal.style.display = 'flex';

            } else {
                alert(`Error: ${data.message}`); // Show a simple alert on failure
            }
        } catch (error) {
            console.error('Error fetching task details:', error);
            alert('A network error occurred.');
        }
    }

    // --- Event Listeners for Filters & Pagination ---
    
    // 1. Filter form changes
    if (filterForm) {
        filterForm.addEventListener('change', (event) => {
            // Update current filters object
            currentFilters.status = filterStatus.value;
            currentFilters.priority = filterPriority.value;
            currentFilters.tag_id = filterTag.value;
            currentFilters.page = 1; // Reset to page 1
            loadTasks(); // Reload tasks
        });
    }
    
    // 2. Pagination link clicks (Event Delegation)
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (event) => {
            event.preventDefault();
            if (event.target.tagName === 'A' && event.target.dataset.page) {
                currentFilters.page = parseInt(event.target.dataset.page, 10);
                loadTasks(); // Reload tasks for the new page
            }
        });
    }

    // --- Initial Load ---
    loadTasks();
    
    // --- Helper function for messages ---
    function showMessage(element, message, type = 'error') {
        if (message) {
            element.textContent = message;
            element.className = `form-message ${type}`;
        } else {
            // If message is empty, hide the element
            element.textContent = '';
            element.className = 'form-message';
        }
    }
});