// Authentication and navigation management for Ghana Lingo

// Check if user is logged in
function isLoggedIn() {
    // Check session storage first
    if (sessionStorage.getItem('user')) {
        return true;
    }
    
    // Check localStorage
    if (localStorage.getItem('user')) {
        return true;
    }
    
    // Check cookie
    if (document.cookie.split(';').some((item) => item.trim().startsWith('token='))) {
        return true;
    }
    
    return false;
}

// Get user information from server
function getUserInfo() {
    // Check session storage first
    if (sessionStorage.getItem('user')) {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        console.log('User data from sessionStorage:', userData); // Debug log
        return userData;
    }
    
    // Check localStorage
    if (localStorage.getItem('user')) {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData); // Debug log
        return userData;
    }
    
    return null;
}

// Fetch user info from server
function fetchUserInfoFromServer(callback) {
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            console.log('User data received from server:', data); // Debug log
            if (data.error) {
                callback(null);
            } else {
                // Store user data in session storage
                sessionStorage.setItem('user', JSON.stringify(data));
                callback(data);
            }
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            callback(null);
        });
}

// Update navigation based on login state
function updateNavigation() {
    const navItems = document.querySelectorAll('nav ul li');
    const loginButton = document.querySelector('.btn-login');
    
    if (isLoggedIn()) {
        // User is logged in
        // Replace Home link with Dashboard link
        const homeLink = document.querySelector('nav ul li a[href="index.html"]');
        if (homeLink) {
            homeLink.href = 'dashboard.html';
            homeLink.textContent = 'Dashboard';
        }
        
        // Update login button to logout button
        if (loginButton) {
            loginButton.textContent = 'Logout';
            loginButton.href = 'logout.html';
        }
    } else {
        // User is not logged in
        // Ensure Home link is correct
        const dashboardLink = document.querySelector('nav ul li a[href="dashboard.html"]');
        if (dashboardLink) {
            dashboardLink.href = 'index.html';
            dashboardLink.textContent = 'Home';
        }
        
        // Update logout button to login button
        if (loginButton) {
            loginButton.textContent = 'Login';
            loginButton.href = 'login.html';
        }
    }
}

// Display user information on dashboard
function displayUserInfo() {
    const userInfoPlaceholder = document.getElementById('user-info-placeholder');
    if (userInfoPlaceholder && isLoggedIn()) {
        // First try to get user data from sessionStorage
        const storedUser = getUserInfo();
        if (storedUser) {
            // Create a default profile picture URL based on user initials
            const userInitials = `${storedUser.firstName?.charAt(0) || ''}${storedUser.lastName?.charAt(0) || ''}`.toUpperCase();
            const profilePicUrl = storedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInitials)}&background=006B3F&color=fff`;
            
            // Display preferred language if available
            const preferredLanguageDisplay = storedUser.preferredLanguage ? 
                `<p style="margin: 0.5rem 0;"><strong>Learning:</strong> <span style="color: #FCD116; font-weight: bold;">${getLanguageName(storedUser.preferredLanguage)}</span></p>` : '';
            
            userInfoPlaceholder.innerHTML = `
                <div style="background: linear-gradient(135deg, #006B3F 0%, #004d2d 100%); border-radius: 15px; padding: 2rem; color: white; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center;">
                        <img src="${profilePicUrl}" alt="Profile Picture" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 1.5rem; border: 3px solid white;">
                        <div>
                            <h2 style="margin: 0 0 0.5rem 0;">${storedUser.firstName} ${storedUser.lastName}</h2>
                            <p style="margin: 0 0 0.5rem 0;">@${storedUser.username}</p>
                            <p style="margin: 0;"><a href="mailto:${storedUser.email}" style="color: #FCD116; text-decoration: none;">${storedUser.email}</a></p>
                            ${preferredLanguageDisplay}
                            <p style="margin: 0.5rem 0;"><strong>Total XP:</strong> <span style="color: #FCD116; font-weight: bold;">1,250 XP</span></p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // If we couldn't get user data from sessionStorage, fetch from server
            fetchUserInfoFromServer(function(user) {
                console.log('User data in displayUserInfo:', user); // Debug log
                if (user) {
                    // Create a default profile picture URL based on user initials
                    const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
                    const profilePicUrl = user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInitials)}&background=006B3F&color=fff`;
                    
                    // Display preferred language if available
                    const preferredLanguageDisplay = user.preferredLanguage ? 
                        `<p style="margin: 0.5rem 0;"><strong>Learning:</strong> <span style="color: #FCD116; font-weight: bold;">${getLanguageName(user.preferredLanguage)}</span></p>` : '';
                    
                    userInfoPlaceholder.innerHTML = `
                        <div style="background: linear-gradient(135deg, #006B3F 0%, #004d2d 100%); border-radius: 15px; padding: 2rem; color: white; margin-bottom: 2rem;">
                            <div style="display: flex; align-items: center;">
                                <img src="${profilePicUrl}" alt="Profile Picture" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 1.5rem; border: 3px solid white;">
                                <div>
                                    <h2 style="margin: 0 0 0.5rem 0;">${user.firstName} ${user.lastName}</h2>
                                    <p style="margin: 0 0 0.5rem 0;">@${user.username}</p>
                                    <p style="margin: 0;"><a href="mailto:${user.email}" style="color: #FCD116; text-decoration: none;">${user.email}</a></p>
                                    ${preferredLanguageDisplay}
                                    <p style="margin: 0.5rem 0;"><strong>Total XP:</strong> <span style="color: #FCD116; font-weight: bold;">1,250 XP</span></p>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    userInfoPlaceholder.innerHTML = `<p>Error loading user information. Please try refreshing the page.</p>`;
                }
            });
        }
    }
}

// Helper function to get language name from code
function getLanguageName(code) {
    const languages = {
        'tw': 'Twi',
        'ee': 'Ewe',
        'gaa': 'Ga',
        'fat': 'Fante',
        'dag': 'Dagbani',
        'ha': 'Hausa',
        'dga': 'Dagaare',
        'nzi': 'Nzema',
        'gjn': 'Gonja'
    };
    return languages[code] || code;
}

// Simulate login
function simulateLogin(userData) {
    console.log('Storing user data in sessionStorage:', userData); // Debug log
    // Store user data in session storage
    sessionStorage.setItem('user', JSON.stringify(userData));
    updateNavigation();
    displayUserInfo();
}

// Simulate logout
function simulateLogout() {
    // Remove user data from storage
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    updateNavigation();
    displayUserInfo();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    displayUserInfo();
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Send login request to server
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    // Store user data in session storage
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    // Update navigation and display user info
                    updateNavigation();
                    displayUserInfo();
                    
                    // Redirect to dashboard after a short delay to ensure DOM updates
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            });
        });
    }
    
    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Handle logout
    const logoutLinks = document.querySelectorAll('a[href="logout.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear session storage
            sessionStorage.removeItem('user');
            
            // Make API call to logout (clear server session and cookies)
            fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            }).catch(err => console.error('Logout API error:', err));
            
            // Update navigation
            updateNavigation();
            
            // Redirect to home
            window.location.href = 'index.html';
        });
    });
});

// Export functions for use in other scripts
window.isLoggedIn = isLoggedIn;
window.getUserInfo = getUserInfo;
window.simulateLogin = simulateLogin;
window.simulateLogout = simulateLogout;
window.updateNavigation = updateNavigation;
window.displayUserInfo = displayUserInfo;
window.handleRegister = handleRegister;

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle registration form submission
function handleRegister(e) {
    // Prevent default form submission
    e.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const preferredLanguage = document.getElementById('preferredLanguage').value;
    
    // Console log for debugging
    console.log('Form values captured:', { firstName, lastName, email, password, preferredLanguage });
    
    // Clear any previous error messages
    clearErrors();
    
    // Client-side validation
    let isValid = true;
    
    if (!firstName) {
        showError('First name is required');
        isValid = false;
    }
    
    if (!lastName) {
        showError('Last name is required');
        isValid = false;
    }
    
    if (!email) {
        showError('Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showError('Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!confirmPassword) {
        showError('Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('Passwords do not match');
        isValid = false;
    }
    
    if (!preferredLanguage) {
        showError('Please select a preferred language');
        isValid = false;
    }
    
    // If validation fails, stop submission
    if (!isValid) {
        return;
    }
    
    // Send registration request to server
    console.log('Sending registration data to server:', { firstName, lastName, email, password, preferredLanguage });

    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        preferredLanguage
      })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showError(data.error);
        } else {
            // Store user data in session storage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            // Update navigation and display user info
            updateNavigation();
            displayUserInfo();
            
            // Show success message and redirect to dashboard
            alert('Registration successful! Welcome to Ghana Lingo.');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
    });
}

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to show error messages
function showError(message) {
    // Create or update error message element
    let errorElement = document.getElementById('registration-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'registration-error';
        errorElement.style.color = '#CE1126';
        errorElement.style.backgroundColor = '#ffe6e6';
        errorElement.style.padding = '1rem';
        errorElement.style.borderRadius = '5px';
        errorElement.style.marginBottom = '1rem';
        errorElement.style.border = '1px solid #CE1126';
        
        // Insert error element before the form
        const form = document.getElementById('registerForm');
        form.parentNode.insertBefore(errorElement, form);
    }
    errorElement.textContent = message;
    
    // Scroll to error message
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Helper function to clear error messages
function clearErrors() {
    const errorElement = document.getElementById('registration-error');
    if (errorElement) {
        errorElement.remove();
    }
}
