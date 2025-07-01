function isURL(str) {
    if (!str) return false;
    // Basic check for common image file extensions or starts with http/https
    // This is a simplified check and not foolproof.
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    if (pattern.test(str)) {
        return true;
    }
    // Additionally, check for common image extensions if it's a relative path or just a filename
    // This part is less reliable if not a full URL.
    // return /\.(jpeg|jpg|gif|png|svg)$/i.test(str);

    // For simplicity with the "Avatar URL/Emoji" field, we'll primarily rely on http/https.
    // If it's not starting with http/https, we'll assume it's an emoji/text.
    return str.startsWith('http://') || str.startsWith('https://');
}

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
            currentUsernameDisplay.innerHTML = ''; // Clear previous content

            const iconString = currentUser.icon || '👤'; // Default if icon is empty

            if (isURL(iconString)) {
                const img = document.createElement('img');
                img.src = iconString;
                img.alt = "avatar";
                img.style.width = '24px';
                img.style.height = '24px';
                img.style.marginRight = '8px';
                img.style.borderRadius = '50%';
                img.style.verticalAlign = 'middle';
                img.style.objectFit = 'cover'; // Added
                currentUsernameDisplay.appendChild(img);
            } else {
                const iconSpan = document.createElement('span');
                iconSpan.textContent = iconString + ' ';
                iconSpan.style.marginRight = '4px';
                currentUsernameDisplay.appendChild(iconSpan);
            }
            currentUsernameDisplay.appendChild(document.createTextNode(currentUser.username));
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

    function createUserListElement(user, isCurrentUser = false) {
        const li = document.createElement('li');
        li.innerHTML = ''; // Clear potential previous content

        const iconString = user.icon || '👤';
        if (isURL(iconString)) {
            const img = document.createElement('img');
            img.src = iconString;
            img.alt = "avatar";
            img.style.width = '20px';
            img.style.height = '20px';
            img.style.marginRight = '5px';
            img.style.borderRadius = '50%';
            img.style.verticalAlign = 'middle';
            img.style.objectFit = 'cover'; // Added
            li.appendChild(img);
        } else {
            const iconSpan = document.createElement('span');
            iconSpan.textContent = iconString + ' ';
            iconSpan.style.marginRight = '2px';
            li.appendChild(iconSpan);
        }
        li.appendChild(document.createTextNode(user.username + (isCurrentUser ? " (You)" : "")));
        return li;
    }

    function populateUserList() {
        // Clear existing users
        usersUl.innerHTML = '';

        // Add current user
        usersUl.appendChild(createUserListElement(currentUser, true));

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


        const iconString = message.icon || '👤';
        const iconContainer = document.createElement('div'); // Container for icon/avatar
        iconContainer.classList.add('icon'); // Use existing class if suitable, or new one
        iconContainer.style.marginRight = '8px'; // Ensure spacing

        if (isURL(iconString)) {
            const img = document.createElement('img');
            img.src = iconString;
            img.alt = "avatar";
            img.style.width = '30px'; // Slightly larger for messages
            img.style.height = '30px';
            img.style.borderRadius = '50%';
            img.style.verticalAlign = 'top'; // Align with top of text block
            img.style.objectFit = 'cover'; // Added
            iconContainer.appendChild(img);
        } else {
            iconContainer.textContent = iconString;
            iconContainer.style.fontSize = '1.5em'; // Make emoji/text icon larger
        }

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content'); // For username, text, timestamp

        const usernameSpan = document.createElement('div');
        usernameSpan.classList.add('username');
        usernameSpan.textContent = message.username;

        const textP = document.createElement('p');
        textP.textContent = message.text;
        textP.style.margin = '0 0 4px 0'; // Adjust paragraph margin

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('timestamp');
        timestampSpan.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageContent.appendChild(usernameSpan);
        messageContent.appendChild(textP);
        messageContent.appendChild(timestampSpan);

        // Structure message: icon on left, content (user, text, time) on right
        msgDiv.style.display = 'flex';
        msgDiv.appendChild(iconContainer);
        msgDiv.appendChild(messageContent);

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

    // Profile Update Logic
    const newUsernameInput = document.getElementById('new-username');
    const newAvatarInput = document.getElementById('new-avatar');
    const updateProfileBtn = document.getElementById('update-profile-btn');

    function updateUserProfile() {
        const newUsername = newUsernameInput.value.trim();
        const newAvatar = newAvatarInput.value.trim();

        if (newUsername === '' && newAvatar === '') {
            alert("Please enter a new username or avatar URL/emoji.");
            return;
        }

        if (newUsername !== '') {
            currentUser.username = newUsername;
        }

        if (newAvatar !== '') {
            currentUser.icon = newAvatar; // We are reusing the 'icon' field for simplicity
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        displayCurrentUser(); // Refresh display in header
        populateUserList(); // Refresh display in user list

        // Future messages will use the new details automatically
        // If old messages should reflect the new username/avatar, that would require re-rendering all messages
        // or storing a persistent userID with messages and looking up user details at render time.
        // For this scope, only new messages and current display will reflect the change.

        newUsernameInput.value = '';
        newAvatarInput.value = '';
        alert("Profile updated!");
    }

    if (updateProfileBtn) { // Ensure the button exists (it might not in a test environment or if HTML is wrong)
        updateProfileBtn.addEventListener('click', updateUserProfile);
    }


    console.log("Chat script loaded. Current user:", currentUser);
});
