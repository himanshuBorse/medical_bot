let lastResponse = ''; // Variable to store the latest bot response
let currentMode = ''; // Track which mode the user is in (diet, exercise, mental health)
let isModeSelected = false; // Flag to track if a mode has been selected

// Function to read text aloud using SpeechSynthesis
function speakMessage(message) {
    var msg = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(msg);
}

// Add click listeners for the new buttons (Diet, Exercise, Mental Health)
document.getElementById('diet-button').addEventListener('click', function() {
    if (currentMode === 'diet') {
        // If already in Diet mode, reset to default
        currentMode = ''; // Reset to default mode
        addMessage('Mode reset to default.', 'reset');
        updateActiveButton('');
        isModeSelected = false;
    } else {
        currentMode = 'diet'; // Switch mode to Diet
        addMessage('You selected: Diet', 'selected');
        updateActiveButton('diet');
        isModeSelected = true;
    }
});

document.getElementById('exercise-button').addEventListener('click', function() {
    if (currentMode === 'exercise') {
        // If already in Exercise mode, reset to default
        currentMode = ''; // Reset to default mode
        addMessage('Mode reset to default.', 'reset');
        updateActiveButton('');
        isModeSelected = false;
    } else {
        currentMode = 'exercise'; // Switch mode to Exercise
        addMessage('You selected: Exercise', 'selected');
        updateActiveButton('exercise');
        isModeSelected = true;
    }
});

document.getElementById('mental-health-button').addEventListener('click', function() {
    if (currentMode === 'mental_health') {
        // If already in Mental Health mode, reset to default
        currentMode = ''; // Reset to default mode
        addMessage('Mode reset to default.', 'reset');
        updateActiveButton('');
        isModeSelected = false;
    } else {
        currentMode = 'mental_health'; // Switch mode to Mental Health
        addMessage('You selected: Mental Health Support', 'selected');
        updateActiveButton('mental_health');
        isModeSelected = true;
    }
});

// Function to update active button styles
function updateActiveButton(selectedMode) {
    // Get all buttons
    var buttons = document.querySelectorAll('.top-buttons button');
    
    // Remove 'active' class from all buttons
    buttons.forEach(function(button) {
        button.classList.remove('active');
    });
    
    // Add 'active' class to the selected button
    if (selectedMode === 'diet') {
        document.getElementById('diet-button').classList.add('active');
    } else if (selectedMode === 'exercise') {
        document.getElementById('exercise-button').classList.add('active');
    } else if (selectedMode === 'mental_health') {
        document.getElementById('mental-health-button').classList.add('active');
    }
}

// Send message when "Send" button is clicked
document.getElementById('send-button').addEventListener('click', function() {
    var userMessage = document.getElementById('user-message').value;
    if (userMessage) {
        addMessage('You: ' + userMessage);
        document.getElementById('user-message').value = '';

        fetch('/get_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'user_message=' + userMessage + '&mode=' + currentMode
        })
        .then(response => response.json())
        .then(data => {
            addMessage('Bot: ' + data.response);
            lastResponse = data.response; // Save the latest bot response
        });
    }
});

// Function to add message to the chatbox
function addMessage(message, type = '') {
    var chatBox = document.getElementById('chat-box');
    var messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Add a class based on the message type (selected or reset)
    if (type === 'selected') {
        messageDiv.classList.add('selected-mode-message'); // Add class for selected mode
    } else if (type === 'reset') {
        messageDiv.classList.add('reset-mode-message'); // Add class for reset mode
    }

    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Voice recognition for mic button
const micButton = document.getElementById('mic-button');
const userMessageInput = document.getElementById('user-message');

// Initialize SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

micButton.addEventListener('click', function() {
    recognition.start(); // Start listening for voice input
});

recognition.onresult = function(event) {
    const speechText = event.results[0][0].transcript;
    userMessageInput.value = speechText;
    addMessage('You: ' + speechText);

    fetch('/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'user_message=' + speechText + '&mode=' + currentMode
    })
    .then(response => response.json())
    .then(data => {
        addMessage('Bot: ' + data.response);
        lastResponse = data.response;
    });
};

recognition.onerror = function(event) {
    alert('Sorry, I didn’t catch that. Please try again.');
};

// Speak the latest response when "Speak Response" button is clicked
document.getElementById('speak-button').addEventListener('click', function() {
    if (lastResponse) {
        speakMessage(lastResponse);
    } else {
        alert('No response to read aloud yet.');
    }
});


// Function to add message to chatbox
function appendMessageToChatbox(message, isUserMessage = false, showAppointmentIcon = false) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.classList.add(isUserMessage ? 'user' : 'bot');
    messageDiv.innerHTML = message;

    // If it's from the default model, add the appointment icon
    if (showAppointmentIcon) {
        const appointmentIcon = `<i class="fas fa-calendar-check appointment-icon" title="Book Appointment"></i>`;
        messageDiv.innerHTML += appointmentIcon;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

// Handle send button for chat
document.getElementById('send-button').addEventListener('click', function() {
    const userMessage = document.getElementById('user-message').value;
    if (userMessage.trim() !== '') {
        appendMessageToChatbox("You: " + userMessage, true);

        // Send message to server for chatbot response
        fetch('/get_response', {
            method: 'POST',
            body: new URLSearchParams({
                'user_message': userMessage,
                'mode': 'default' // Adjust this based on your mode (diet, exercise, etc.)
            })
        })
        .then(response => response.json())
        .then(data => {
            const botResponse = data.response;
            const showAppointmentIcon = data.show_appointment_icon;
            appendMessageToChatbox(botResponse, false, showAppointmentIcon);
        })
        .catch(error => console.error('Error:', error));
    }
});
    // Show the appointment form modal when hamburger menu is clicked
    document.getElementById('hamburger-menu').addEventListener('click', function() {
        const modal = document.getElementById("appointmentModal");
        modal.style.display = "block";  // Show the modal
    });

    // Close the modal when user clicks the "X" button
    document.getElementById('close-modal').addEventListener('click', function() {
        const modal = document.getElementById("appointmentModal");
        modal.style.display = "none";  // Close the modal
    });

    // Close the modal if the user clicks outside the modal content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById("appointmentModal");
        if (event.target === modal) {
            modal.style.display = "none";  // Close the modal
        }
    });

    // Handle appointment form submission (Optional: You can handle form submission here)
    document.getElementById('book-appointment-button').addEventListener('click', function() {
        const name = document.getElementById('appointment-name').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;

        // Check if all fields are filled
        if (name && date && time) {
            // For demo purposes, log the appointment details
            console.log(`Appointment Booked: ${name} | ${date} | ${time}`);
            // Optionally, close the modal after booking the appointment
            const modal = document.getElementById("appointmentModal");
            modal.style.display = "none";  // Close the modal after booking
        } else {
            alert("Please fill in all fields.");
        }
    });
    // Show the appointment form modal when hamburger menu is clicked
    document.getElementById('hamburger-menu').addEventListener('click', function() {
        const modal = document.getElementById("appointmentModal");
        modal.style.display = "block";  // Show the modal
    });

    // Close the modal when user clicks the "X" button
    document.getElementById('close-modal').addEventListener('click', function() {
        const modal = document.getElementById("appointmentModal");
        modal.style.display = "none";  // Close the modal
    });

    // Close the modal if the user clicks outside the modal content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById("appointmentModal");
        if (event.target === modal) {
            modal.style.display = "none";  // Close the modal
        }
    });

    // Date validation: Allow only current date or future dates
    const appointmentDateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    appointmentDateInput.setAttribute('min', today); // Set the minimum date to today

    // Time validation: Allow only time from 9:00 AM to 11:00 PM
    const appointmentTimeInput = document.getElementById('appointment-time');
    appointmentTimeInput.setAttribute('min', '09:00'); // Set the minimum time to 09:00 AM
    appointmentTimeInput.setAttribute('max', '23:00'); // Set the maximum time to 11:00 PM

    // Handle appointment form submission
    document.getElementById('book-appointment-button').addEventListener('click', function() {
        const name = document.getElementById('appointment-name').value;
        const email = document.getElementById('appointment-email').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;

        // Simple email validation (basic check)
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Check if all fields are filled
        if (name && email && date && time) {
            // For demo purposes, log the appointment details
            console.log(`Appointment Booked: ${name} | ${email} | ${date} | ${time}`);
            
            // Display success message
            alert("Your booking has been done successfully. We will remind you for the appointment!");

            // Optionally, close the modal after booking the appointment
            const modal = document.getElementById("appointmentModal");
            modal.style.display = "none";  // Close the modal after booking
        } else {
            alert("Please fill in all fields.");
        }
    });
