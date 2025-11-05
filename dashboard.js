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

    // --- NEW: Task Form Elements ---
    const newTaskForm = document.getElementById('new-task-form');
    const taskTagList = document.getElementById('task-tag-list');
    const newTaskMessage = document.getElementById('new-task-message');

    // --- NEW: Load Tags into the Task Form on Page Load ---
    async function loadTagsForTaskForm() {
        if (!taskTagList) return; // Only run if the element exists
        
        try {
            const response = await fetch('api/get_tags.php');
            const data = await response.json();

            if (data.status === 'success') {
                taskTagList.innerHTML = ''; // Clear "Loading..."
                if (data.tags.length === 0) {
                    taskTagList.innerHTML = '<p>No tags created yet. Go to "Manage Tags" to add some.</p>';
                    return;
                }
                
                // Create a checkbox for each tag
                data.tags.forEach(tag => {
                    const tagOption = document.createElement('label');
                    tagOption.className = 'tag-option';
                    
                    // Sanitize tag name before inserting
                    const tagName = document.createTextNode(tag.name); 
                    
                    tagOption.innerHTML = `
                        <input type="checkbox" value="${tag.id}">
                    `;
                    tagOption.appendChild(tagName);
                    taskTagList.appendChild(tagOption);
                });

            } else {
                taskTagList.innerHTML = `<p class="error">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error loading tags for task form:', error);
            taskTagList.innerHTML = '<p class="error">Failed to load tags.</p>';
        }
    }
    
    // Call the new function on page load
    loadTagsForTaskForm();

    // --- NEW: Handle New Task Form Submission ---
    if (newTaskForm) {
        newTaskForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(newTaskMessage, '', 'success'); // Clear previous messages
            
            // 1. Get all form values
            const title = document.getElementById('task-title').value.trim();
            const description = document.getElementById('task-description').value.trim();
            const status = document.getElementById('task-status').value;
            const priority = document.getElementById('task-priority').value;
            const due_date = document.getElementById('task-due-date').value;

            // 2. Get selected tag IDs
            const selectedTags = [];
            const checkboxes = taskTagList.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(cb => {
                selectedTags.push(cb.value);
            });

            // 3. Client-side validation
            if (!title) {
                showMessage(newTaskMessage, 'Title is required.', 'error');
                return;
            }

            // 4. Prepare data for fetch()
            const taskData = {
                title: title,
                description: description,
                status: status,
                priority: priority,
                due_date: due_date,
                tag_ids: selectedTags // Send as an array
            };

            // 5. Send data to the backend
            try {
                const response = await fetch('api/create_task.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    showMessage(newTaskMessage, data.message, 'success');
                    newTaskForm.reset(); // Clear the form
                    
                    // Uncheck all tag checkboxes
                    checkboxes.forEach(cb => cb.checked = false);
                    
                    // We'll add the function to reload the task list here later
                    // loadTasks(); 
                    console.log('Task created! ID:', data.new_task_id);

                } else {
                    showMessage(newTaskMessage, data.message, 'error');
                }

            } catch (error) {
                console.error('Error creating task:', error);
                showMessage(newTaskMessage, 'A network error occurred.', 'error');
            }
        });
    }
    
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