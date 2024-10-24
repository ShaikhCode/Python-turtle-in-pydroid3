// Initialize Speech Recognition API
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = true;  // Make recognition continuous

let novaActive = false;
let deactivateTimeout;

// Function to activate Nova
function activateNova() {
    novaActive = true;
    document.getElementById('novaStatus').innerHTML = "Nova is active <span class='active-circle'></span>";
    
    // Reset and set the deactivation timeout
    clearTimeout(deactivateTimeout);
    deactivateTimeout = setTimeout(deactivateNova, 16000);
    
    // Speak immediately after activation
    speak("Hi master, what can I do?");
}

// Function to deactivate Nova
function deactivateNova() {
    novaActive = false;
    document.getElementById('novaStatus').innerHTML = "Nova is not active <span class='inactive-circle'></span>";
    clearTimeout(deactivateTimeout);
}

// Start listening immediately
recognition.start();

// Restart recognition after each result
recognition.onend = function() {
    recognition.start();
};

// Handle voice results
recognition.onresult = function(event) {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
    console.log('Voice Command:', transcript);

    // Check for "nova" keyword
    if (
        transcript.includes('nova') || 
        transcript.includes('hey nova') || 
        transcript.includes('hello nova') || 
        transcript.includes('hi nova') || 
        transcript.includes('ok nova')
    ) {
        activateNova();
    }

    if (novaActive) {
        // Reset the timeout on any command received
        clearTimeout(deactivateTimeout);
        deactivateTimeout = setTimeout(deactivateNova, 16000);

        if (transcript.includes('turn on bulb')) {
            sendCommand('relay1_on');
        } else if (transcript.includes('turn off bulb')) {
            sendCommand('relay1_off');
        } else if (transcript.includes('on bulb')) {
            sendCommand('relay1_on');
        } else if (transcript.includes('off bulb')) {
            sendCommand('relay1_off');
        } else if (transcript.includes('turn on the bulb')) {
            sendCommand('relay1_on');
        } else if (transcript.includes('turn off the bulb')) {
            sendCommand('relay1_off');
        } else if (transcript.includes('turn on fan')) {
            sendCommand('relay2_on');
        } else if (transcript.includes('turn off fan')) {
            sendCommand('relay2_off');
        } else if (transcript.includes('on fan')) {
            sendCommand('relay2_on');
        } else if (transcript.includes('off fan')) {
            sendCommand('relay2_off');
        } else if (transcript.includes('turn on all')) {
            sendCommand('all_on');
        } else if (transcript.includes('turn all off')) {
            sendCommand('all_off');
        } else if (transcript.includes('search for')) {
            const searchQuery = transcript.split('search for')[1].trim();
            searchWikipedia(searchQuery);
        }
    }
};

// Send command to Arduino
function sendCommand(command) {
    fetch(`/${command}`)
        .then(response => {
            if (response.ok) {
                console.log('Command sent:', command);
                speak("Trying to " + command); // Adjusted to include the command in the response
            } else {
                console.error('Failed to send command');
                speak("Failed to send command");
            }
        });
}

// Function to search Wikipedia
function searchWikipedia(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const firstResult = data.query.search[0].snippet;
            speak(`I found this: ${firstResult.replace(/<\/?[^>]+(>|$)/g, "")}`);
        })
        .catch(error => console.log('Error:', error));
}

// Text-to-Speech function
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    
    // Ensure the speech synthesis is ready before starting recognition again
    utterance.onend = function() {
        recognition.start(); // Restart listening after speaking
    };

    window.speechSynthesis.speak(utterance);
}

// Function to check Arduino connection
function checkArduinoConnection() {
    fetch('/check_connection')
        .then(response => {
            const arduinoStatus = document.getElementById('arduinoStatus');
            if (response.ok) {
                arduinoStatus.textContent = "Arduino Connected";
                arduinoStatus.classList.remove('not-connected');
                arduinoStatus.classList.add('connected');
            } else {
                arduinoStatus.textContent = "Arduino Not Connected";
                arduinoStatus.classList.remove('connected');
                arduinoStatus.classList.add('not-connected');
            }
        })
        .catch(error => {
            console.log('Error checking connection:', error);
            const arduinoStatus = document.getElementById('arduinoStatus');
            arduinoStatus.textContent = "Arduino Not Connected";
            arduinoStatus.classList.remove('connected');
            arduinoStatus.classList.add('not-connected');
        });
}

// Check Arduino connection every 5 seconds
setInterval(checkArduinoConnection, 5000);