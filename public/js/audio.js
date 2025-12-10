// Audio playback functionality for Ghana Lingo

// Function to play audio pronunciation
function playAudio(word) {
    // In a real implementation, this would play actual audio files
    // For now, we'll show an alert with the word
    alert("🔊 Playing pronunciation for: " + word);
    
    // Example of how this would work with actual audio files:
    /*
    const audio = new Audio(`/audio/${word}.mp3`);
    audio.play()
        .then(() => console.log("Playing audio for: " + word))
        .catch(e => console.error("Error playing audio:", e));
    */
}

// Function to check quiz answers
function checkAnswer(element, status) {
    if (status === 'correct') {
        element.style.backgroundColor = '#006B3F';
        element.style.color = 'white';
        setTimeout(() => {
            alert("Correct! Well done.");
            element.style.backgroundColor = '';
            element.style.color = '';
        }, 1000);
    } else {
        element.style.backgroundColor = '#CE1126';
        element.style.color = 'white';
        setTimeout(() => {
            element.style.backgroundColor = '';
            element.style.color = '';
        }, 1000);
    }
}

// Function to handle form submissions
function handleFormSubmission(formId, successMessage) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert(successMessage);
            form.reset();
        });
    }
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Service request form
    handleFormSubmission('service-form', 'Thank you! Your service request has been submitted. We will contact you shortly.');
    
    // Registration form
    handleFormSubmission('register-form', 'Account created successfully! Please check your email for verification.');
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Welcome back! You have been logged in as ${email}`);
            // In a real app, this would redirect to dashboard
            // window.location.href = '/dashboard.html';
        });
    }
});

// Export functions for use in other scripts
window.playAudio = playAudio;
window.checkAnswer = checkAnswer;