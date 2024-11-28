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
