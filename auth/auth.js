// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // =====================================
    // --- NEW LOGOUT HANDLER ---
    // =====================================

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'logged_out') {
        const formMessage = document.getElementById('form-message');
        if (formMessage) {
            formMessage.textContent = 'You have been logged out.';
            formMessage.className = 'form-message success';
        }
    }
    
    // =====================================
    // --- REGISTER FORM HANDLER ---
    // =====================================
    
    // Find the registration form
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        // Add a 'submit' event listener to the registration form
        registerForm.addEventListener('submit', async (event) => {
            // 1. Prevent the default form submission (which reloads the page)
            event.preventDefault();
            
            // 2. Clear previous errors
            clearErrors();
            const formMessage = document.getElementById('form-message');
            formMessage.textContent = '';
            formMessage.className = 'form-message'; // Reset class

            // 3. Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password_confirm = document.getElementById('password_confirm').value;

            // 4. Client-side validation (for instant feedback)
            let isValid = true;
            if (name.trim() === '') {
                showError('name-error', 'Name is required.');
                isValid = false;
            }
            if (email.trim() === '') {
                showError('email-error', 'Email is required.');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('email-error', 'Please enter a valid email address.');
                isValid = false;
            }
            if (password === '') {
                showError('password-error', 'Password is required.');
                isValid = false;
            }
            if (password !== password_confirm) {
                showError('password_confirm-error', 'Passwords do not match.');
                isValid = false;
            }

            if (!isValid) {
                return; // Stop if client-side validation fails
            }

            // 5. Prepare data to send to the server
            const formData = {
                name: name,
                email: email,
                password: password,
                password_confirm: password_confirm
            };

            try {
                // 6. Use the fetch() API to send data to the backend
                const response = await fetch('../api/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                // 7. Handle the server's response
                if (result.status === 'success') {
                    // Show success message
                    formMessage.textContent = result.message;
                    formMessage.className = 'form-message success';
                    
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000); // 2-second delay

                } else {
                    // Show general error message
                    formMessage.textContent = result.message || 'An error occurred.';
                    formMessage.className = 'form-message error';

                    // Show specific field errors if the server sent them
                    if (result.errors) {
                        for (const key in result.errors) {
                            showError(`${key}-error`, result.errors[key]);
                        }
                    }
                }

            } catch (error) {
                // Handle network errors
                console.error('Fetch error:', error);
                formMessage.textContent = 'A network error occurred. Please try again.';
                formMessage.className = 'form-message error';
            }
        });
    }

    // =====================================
    // --- LOGIN FORM HANDLER ---
    // =====================================

    // Find the login form
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            // 1. Prevent the default form submission
            event.preventDefault();

            // 2. Clear previous errors
            clearErrors();
            const formMessage = document.getElementById('form-message');
            formMessage.textContent = '';
            formMessage.className = 'form-message'; // Reset class

            // 3. Get form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 4. Client-side validation
            let isValid = true;
            if (email.trim() === '') {
                showError('email-error', 'Email is required.');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('email-error', 'Please enter a valid email address.');
                isValid = false;
            }
            if (password === '') {
                showError('password-error', 'Password is required.');
                isValid = false;
            }

            if (!isValid) {
                return; // Stop if client-side validation fails
            }

            // 5. Prepare data to send to the server
            const formData = {
                email: email,
                password: password
            };

            try {
                // 6. Use the fetch() API to send data to the backend
                const response = await fetch('../api/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                // 7. Handle the server's response
                if (result.status === 'success') {
                    // Show success message
                    formMessage.textContent = result.message;
                    formMessage.className = 'form-message success';
                    
                    // Redirect to the dashboard
                    // We use the redirect URL from the server
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1000); // 1-second delay

                } else {
                    // Show general error message
                    formMessage.textContent = result.message || 'An error occurred.';
                    formMessage.className = 'form-message error';
                    
                    // Clear password field on error
                    document.getElementById('password').value = ''; 
                    
                    // Show specific field errors if the server sent them
                    if (result.errors) {
                        for (const key in result.errors) {
                            showError(`${key}-error`, result.errors[key]);
                        }
                    }
                }

            } catch (error) {
                // Handle network errors
                console.error('Fetch error:', error);
                formMessage.textContent = 'A network error occurred. Please try again.';
                formMessage.className = 'form-message error';
            }
        });
    }


    // =====================================
    // --- HELPER FUNCTIONS (Existing) ---
    // =====================================

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    function validateEmail(email) {
        // A simple regex for email validation
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase());
    }

});