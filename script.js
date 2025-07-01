document.addEventListener('DOMContentLoaded', () => {
    const currentUsernameDisplay = document.createElement('span');
    currentUsernameDisplay.id = 'current-username-display';
    currentUsernameDisplay.style.marginLeft = '20px';
    currentUsernameDisplay.style.fontSize = '0.9em';
    document.querySelector('header nav').appendChild(currentUsernameDisplay);

    let currentUser = {};

    const ICONS = ['😊', '🎉', '🚀', '🌟', '💡', '💻', '🤖', '🌍', '🎨', '📚'];

    function initializeUser() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        } else {
            const userId = Math.floor(Math.random() * 10000);
            currentUser = {
                username: `User${userId}`,
                icon: ICONS[Math.floor(Math.random() * ICONS.length)]
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        displayCurrentUser();
    }

    function displayCurrentUser() {
        if (currentUser && currentUser.username) {
            currentUsernameDisplay.textContent = `${currentUser.icon} ${currentUser.username}`;
        }
    }

    // Initialize
    initializeUser();

    // Geolocation
    const refreshLocationBtn = document.getElementById('refresh-location-btn');
    const locationDisplay = document.createElement('span');
    locationDisplay.id = 'location-display';
    locationDisplay.style.marginLeft = '20px';
    locationDisplay.style.fontSize = '0.8em';
    locationDisplay.style.color = '#ccc';
    document.querySelector('header nav').appendChild(locationDisplay);

    function getLocation() {
        if (navigator.geolocation) {
            locationDisplay.textContent = 'Fetching location...';
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            locationDisplay.textContent = "Geolocation is not supported by this browser.";
            console.warn("Geolocation is not supported by this browser.");
        }
    }

    function showPosition(position) {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        locationDisplay.textContent = `Lat: ${lat}, Lon: ${lon}`;
        console.log(`Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
        // Here you would typically "broadcast" your new location or find nearby users.
        // For local-only, this might update a list of simulated users or distances.
    }

    function showError(error) {
        let message = "Error fetching location: ";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message += "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                message += "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                message += "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                message += "An unknown error occurred.";
                break;
        }
        locationDisplay.textContent = message;
        console.error(message);
    }

    refreshLocationBtn.addEventListener('click', getLocation);

    // Initial location fetch on load (optional)
    // getLocation();

    // User List Toggle
    const userListSidebar = document.getElementById('user-list-sidebar');
    const toggleUserListCheckbox = document.getElementById('toggle-user-list-checkbox');
    const usersUl = document.getElementById('users');

    function populateUserList() {
        // Clear existing users
        usersUl.innerHTML = '';

        // Add current user
        const currentUserLi = document.createElement('li');
        currentUserLi.textContent = `${currentUser.icon} ${currentUser.username} (You)`;
        usersUl.appendChild(currentUserLi);

        // Add some mock nearby users
        const mockUsers = [
            { username: 'Alice', icon: '👩‍💻' },
            { username: 'Bob', icon: '👨‍🎨' },
            { username: 'Charlie', icon: '🧑‍🚀' }
        ];

        mockUsers.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.icon} ${user.username}`;
            usersUl.appendChild(li);
        });
    }

    function toggleUserList() {
        if (toggleUserListCheckbox.checked) {
            userListSidebar.classList.remove('hidden');
            // userListSidebar.style.width = '200px'; // Managed by CSS class
            // userListSidebar.style.padding = '15px'; // Managed by CSS class
        } else {
            userListSidebar.classList.add('hidden');
            // userListSidebar.style.width = '0'; // Managed by CSS class
            // userListSidebar.style.padding = '0'; // Managed by CSS class
        }
    }

    toggleUserListCheckbox.addEventListener('change', toggleUserList);

    // Initial population
    populateUserList();
    // Ensure the list visibility matches the checkbox state on load
    // The 'checked' attribute in HTML handles the initial state, CSS handles the display.
    // Call toggleUserList to ensure consistency if JS loads after CSS or checkbox is manipulated by other scripts.
    toggleUserList();

    // Messaging
    const messageDisplay = document.getElementById('message-display');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const LOCAL_STORAGE_MESSAGES_KEY = 'chatMessages';

    function loadMessages() {
        const storedMessages = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
        return storedMessages ? JSON.parse(storedMessages) : [];
    }

    function saveMessages(messages) {
        localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    }

    function displayMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');

        // Determine if the message was sent by the current user
        if (message.username === currentUser.username && message.icon === currentUser.icon) {
            msgDiv.classList.add('sent');
        } else {
            // For this local-only version, all messages are technically "sent" by the current user
            // in different sessions, or they are just part of the stored log.
            // If we were to simulate other users more directly, this logic would change.
            // For now, let's assume any message not matching current session's user is "received"
            // This will mostly apply if the user changes their username/icon or clears local storage for user details.
            msgDiv.classList.add('received'); // Defaulting to received if not explicitly current user.
                                          // This is a bit of a simplification for local-only.
                                          // A better approach for "sent" would be to pass a flag or check a unique sender ID.
                                          // Given the current setup, all messages from local storage will appear as "sent"
                                          // if the `currentUser` object matches the one that sent them.
        }


        const iconSpan = document.createElement('span');
        iconSpan.classList.add('icon');
        iconSpan.textContent = message.icon;

        const usernameSpan = document.createElement('div'); // Changed to div for block display
        usernameSpan.classList.add('username');
        usernameSpan.textContent = message.username;

        const textP = document.createElement('p');
        textP.textContent = message.text;

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('timestamp');
        timestampSpan.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgDiv.appendChild(iconSpan); // Icon first, then username
        msgDiv.appendChild(usernameSpan);
        msgDiv.appendChild(textP);
        msgDiv.appendChild(timestampSpan);

        messageDisplay.appendChild(msgDiv);
        messageDisplay.scrollTop = messageDisplay.scrollHeight; // Scroll to bottom
    }

    function displayAllMessages() {
        messageDisplay.innerHTML = ''; // Clear existing messages
        const messages = loadMessages();
        messages.forEach(displayMessage);
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;

        const message = {
            username: currentUser.username,
            icon: currentUser.icon,
            text: text,
            timestamp: new Date().toISOString()
        };

        const messages = loadMessages();
        messages.push(message);
        saveMessages(messages);

        displayMessage(message); // Display the new message immediately
        messageInput.value = ''; // Clear input
    }

    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Load and display messages on initial load
    displayAllMessages();

    console.log("Chat script loaded. Current user:", currentUser);
});
