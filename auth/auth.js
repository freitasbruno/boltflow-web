document.addEventListener('DOMContentLoaded', () => {

    // --- Logout Message Handler ---
    const params = new URLSearchParams(window.location.search);
    const formMessage = document.getElementById('form-message');
    
    if (params.get('status') === 'logged_out' && formMessage) {
        formMessage.textContent = 'You have been logged out.';
        // Use Bootstrap alert classes
        formMessage.className = 'alert alert-success mb-3';
    }
    
    // --- Register Form Handler ---
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            clearErrors();
            // Reset message
            if (formMessage) {
                formMessage.textContent = '';
                formMessage.className = '';
            }

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password_confirm = document.getElementById('password_confirm').value;

            // Client-side validation
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

            if (!isValid) return;

            const formData = {
                name: name,
                email: email,
                password: password,
                password_confirm: password_confirm
            };

            try {
                const response = await fetch('../api/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    if (formMessage) {
                        formMessage.textContent = result.message;
                        // Use Bootstrap alert classes
                        formMessage.className = 'alert alert-success mb-3';
                    }
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000); 

                } else {
                    if (formMessage) {
                        formMessage.textContent = result.message || 'An error occurred.';
                        // Use Bootstrap alert classes
                        formMessage.className = 'alert alert-danger mb-3';
                    }
                    if (result.errors) {
                        for (const key in result.errors) {
                            showError(`${key}-error`, result.errors[key]);
                        }
                    }
                }

            } catch (error) {
                console.error('Fetch error:', error);
                if (formMessage) {
                    formMessage.textContent = 'A network error occurred. Please try again.';
                    // Use Bootstrap alert classes
                    formMessage.className = 'alert alert-danger mb-3';
                }
            }
        });
    }

    // --- Login Form Handler ---
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            clearErrors();
            // Reset message
            if (formMessage) {
                formMessage.textContent = '';
                formMessage.className = '';
            }

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

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

            if (!isValid) return;

            const formData = {
                email: email,
                password: password
            };

            try {
                const response = await fetch('../api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    if (formMessage) {
                        formMessage.textContent = result.message;
                        // Use Bootstrap alert classes
                        formMessage.className = 'alert alert-success mb-3';
                    }
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1000);

                } else {
                    if (formMessage) {
                        formMessage.textContent = result.message || 'An error occurred.';
                        // Use Bootstrap alert classes
                        formMessage.className = 'alert alert-danger mb-3';
                    }
                    document.getElementById('password').value = ''; 
                    
                    if (result.errors) {
                        for (const key in result.errors) {
                            showError(`${key}-error`, result.errors[key]);
                        }
                    }
                }

            } catch (error) {
                console.error('Fetch error:', error);
                if (formMessage) {
                    formMessage.textContent = 'A network error occurred. Please try again.';
                    // Use Bootstrap alert classes
                    formMessage.className = 'alert alert-danger mb-3';
                }
            }
        });
    }


    // --- Helper Functions (Updated) ---

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            // No need for display:block, text-danger class is enough
        }
    }

    function clearErrors() {
        // We find by class now, but IDs are still used to populate
        const errorMessages = document.querySelectorAll('.text-danger.small.mt-1');
        errorMessages.forEach(el => {
            el.textContent = '';
        });
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase());
    }

});