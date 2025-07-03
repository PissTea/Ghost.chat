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

    // Global state for user's location
    let currentUserLatitude = null;
    let currentUserLongitude = null;

    // Mock users with locations (example coordinates around a central point like London for demo)
    // These should be defined in a scope accessible by populateUserList
    const MOCK_USERS_DATA = [
        { username: 'Alice', icon: '👩‍💻', latitude: 51.5074, longitude: 0.1278 }, // Approx London
        { username: 'Bob', icon: '👨‍🎨', latitude: 51.5174, longitude: 0.1378 },   // Slightly North-East
        { username: 'Charlie', icon: '🧑‍🚀', latitude: 51.4974, longitude: 0.1178 }, // Slightly South-West
        { username: 'Diana', icon: '🦸‍♀️', latitude: 34.0522, longitude: -118.2437 }, // Approx Los Angeles (far away)
        { username: 'Edward', icon: '👨‍🔬', latitude: 51.5050, longitude: 0.1200 }  // Closer to London center
    ];


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
        currentUserLatitude = position.coords.latitude;
        currentUserLongitude = position.coords.longitude;
        const lat = currentUserLatitude.toFixed(4);
        const lon = currentUserLongitude.toFixed(4);
        locationDisplay.textContent = `Lat: ${lat}, Lon: ${lon}`;
        console.log(`User position updated: Lat: ${currentUserLatitude}, Lon: ${currentUserLongitude}`);

        // Trigger user list update after location is known
        populateUserList();
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

        usersUl.appendChild(createUserListElement(currentUser, true)); // Display current user first

        const proximityRadiusInput = document.getElementById('proximity-radius');
        const proximityRadiusKm = parseFloat(proximityRadiusInput.value) || 10; // Default to 10km if input is invalid

        MOCK_USERS_DATA.forEach(mockUser => {
            if (currentUserLatitude !== null && currentUserLongitude !== null) {
                const distance = getDistance(
                    currentUserLatitude, currentUserLongitude,
                    mockUser.latitude, mockUser.longitude
                );

                if (distance <= proximityRadiusKm) {
                    const li = createUserListElement(mockUser);
                    const distanceSpan = document.createElement('span');
                    distanceSpan.textContent = ` (${distance.toFixed(1)} km)`;
                    distanceSpan.style.fontSize = '0.8em';
                    distanceSpan.style.color = '#777'; // Use a theme variable later if needed
                    li.appendChild(distanceSpan);
                    usersUl.appendChild(li);
                }
            } else {
                // If user's location is not known, display all mock users without distance
                // Or, you might choose to display none until location is fetched.
                // For now, let's display them so the list isn't empty before first location fetch.
                const li = createUserListElement(mockUser);
                const distanceSpan = document.createElement('span');
                distanceSpan.textContent = ` (distance unknown)`;
                distanceSpan.style.fontSize = '0.8em';
                distanceSpan.style.color = '#aaa';
                li.appendChild(distanceSpan);
                usersUl.appendChild(li);
            }
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
    populateUserList(); // Initial call to populate based on default radius / no location
    // Ensure the list visibility matches the checkbox state on load
    // The 'checked' attribute in HTML handles the initial state, CSS handles the display.
    // Call toggleUserList to ensure consistency if JS loads after CSS or checkbox is manipulated by other scripts.
    toggleUserList();

    // Event listener for proximity radius input
    const proximityRadiusInput = document.getElementById('proximity-radius');
    if (proximityRadiusInput) {
        proximityRadiusInput.addEventListener('input', () => {
            // Add a small debounce if desired, but for now, direct call
            populateUserList();
        });
    }

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

        if (text.startsWith('/')) {
            handleCommand(text);
        } else {
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
        }
        messageInput.value = ''; // Clear input
    }

    function handleCommand(commandString) {
        const parts = commandString.slice(1).split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Placeholder for actual command handlers
        // console.log(`Command: ${command}, Args: ${args.join(' ')}`);

        switch (command) {
            case 'nick':
                handleNickCommand(args);
                break;
            case 'avatar':
                handleAvatarCommand(args);
                break;
            case 'clear':
                handleClearCommand();
                break;
            case 'theme':
                handleThemeCommand(args);
                break;
            case 'help':
                handleHelpCommand();
                break;
            case 'me':
                handleMeCommand(args);
                break;
            case 'whoami':
                handleWhoAmICommand();
                break;
            case 'roll':
                handleRollCommand(args);
                break;
            case 'random':
                handleRandomCommand(args);
                break;
            case 'flip':
                handleFlipCommand();
                break;
            default:
                displaySystemMessage(`Unknown command: /${command}. Type /help for assistance.`, 'error');
        }
    }

    function handleFlipCommand() {
        const result = Math.random() < 0.5 ? "Heads!" : "Tails!";
        displaySystemMessage(result, 'info');
    }

    function handleRandomCommand(args) {
        let min = 1;
        let max;

        if (args.length === 0) {
            displaySystemMessage('Usage: /random [max] or /random [min] [max]', 'error');
            return;
        }

        if (args.length === 1) {
            max = parseInt(args[0]);
        } else if (args.length === 2) {
            min = parseInt(args[0]);
            max = parseInt(args[1]);
        } else {
            displaySystemMessage('Too many arguments. Usage: /random [max] or /random [min] [max]', 'error');
            return;
        }

        if (isNaN(min) || isNaN(max)) {
            displaySystemMessage('Arguments must be numbers.', 'error');
            return;
        }

        if (min > max) {
            displaySystemMessage('Min value cannot be greater than max value.', 'error');
            return;
        }

        // Add reasonable limits for min/max if desired, e.g.
        // if (min < -1000000 || max > 1000000 || max - min > 1000000) {
        //    displaySystemMessage('Range is too large or numbers out of bounds.', 'error');
        //    return;
        // }


        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        displaySystemMessage(`Random number (${min}-${max}): ${randomNumber}`, 'info');
    }

    function handleMeCommand(args) {
        if (args.length === 0) {
            displaySystemMessage('Usage: /me <action>', 'error');
            return;
        }
        const actionText = args.join(' ');
        const message = `* ${currentUser.username} ${actionText}`;
        displaySystemMessage(message, 'emote');
    }

    function handleWhoAmICommand() {
        let userInfo = `Username: ${currentUser.username}\nIcon/Avatar: ${currentUser.icon}`;

        const locationElement = document.getElementById('location-display');
        if (locationElement) {
            const locationText = locationElement.textContent;
            if (locationText &&
                !locationText.toLowerCase().includes("fetching") &&
                !locationText.toLowerCase().includes("error") &&
                !locationText.toLowerCase().includes("not supported") &&
                locationText.trim() !== '') {
                userInfo += `\nLocation: ${locationText}`;
            }
        }
        displaySystemMessage(userInfo, 'info');
    }

    function handleRollCommand(args) {
        if (args.length === 0) {
            displaySystemMessage('Usage: /roll [NdN] (e.g., /roll 2d6 or /roll d20)', 'error');
            return;
        }
        const rollPattern = /^(\d*)d(\d+)$/i; // Matches NdN, dN. Case insensitive.
        const match = args[0].match(rollPattern);

        if (!match) {
            displaySystemMessage('Invalid format. Usage: /roll [NdN] (e.g., /roll 2d6 or /roll d20)', 'error');
            return;
        }

        let numDice = parseInt(match[1]) || 1; // Default to 1 die if not specified
        let numSides = parseInt(match[2]);

        if (numDice < 1 || numDice > 100) { // Added validation for numDice
            displaySystemMessage('Number of dice must be between 1 and 100.', 'error');
            return;
        }
        if (numSides < 2 || numSides > 1000) { // Added validation for numSides
            displaySystemMessage('Number of sides must be between 2 and 1000.', 'error');
            return;
        }

        let rolls = [];
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * numSides) + 1;
            rolls.push(roll);
            total += roll;
        }

        let resultMessage = `You rolled ${args[0].toLowerCase()}: ${rolls.join(', ')}.`;
        if (numDice > 1) {
            resultMessage += ` Total: ${total}.`;
        }
        displaySystemMessage(resultMessage, 'info');
    }

    function handleNickCommand(args) {
        if (args.length === 0 || args[0].trim() === '') {
            displaySystemMessage('Usage: /nick <new_username>', 'error');
            return;
        }
        const newUsername = args.join(' '); // Allow usernames with spaces
        currentUser.username = newUsername;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        displayCurrentUser();
        populateUserList();
        displaySystemMessage(`Username changed to "${newUsername}".`, 'success');
    }

    function handleAvatarCommand(args) {
        if (args.length === 0 || args[0].trim() === '') {
            displaySystemMessage('Usage: /avatar <url_or_emoji>', 'error');
            return;
        }
        const newAvatar = args.join(' '); // Allow avatar URLs/emojis with spaces, though less common for URLs
        currentUser.icon = newAvatar;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        displayCurrentUser();
        populateUserList();
        // Also need to update current user's avatar in any displayed messages if we were to re-render them.
        // For simplicity, existing messages will keep old avatar. New messages will use new avatar.
        displaySystemMessage('Avatar updated.', 'success');
    }

    function handleClearCommand() {
        messageDisplay.innerHTML = '';
        localStorage.removeItem(LOCAL_STORAGE_MESSAGES_KEY);
        // We might want to keep an empty array in local storage after clear
        // saveMessages([]); // Alternative to remove item
        displaySystemMessage('Chat history cleared.', 'info');
    }

    function handleThemeCommand(args) {
        if (args.length === 0) {
            displaySystemMessage('Usage: /theme <theme_name>. Available: light, dark, oled-black, crt.', 'error');
            return;
        }
        const themeName = args[0].toLowerCase();
        const availableThemes = ['light', 'dark', 'oled-black', 'crt'];
        if (availableThemes.includes(themeName)) {
            applyTheme(themeName); // applyTheme already updates selector and saves to LS
            displaySystemMessage(`Theme changed to ${themeName}.`, 'success');
        } else {
            displaySystemMessage(`Invalid theme: ${themeName}. Available: light, dark, oled-black, crt.`, 'error');
        }
    }

    function handleHelpCommand() {
        const helpText = `Available commands:
/nick <new_username> - Change your username.
/avatar <url_or_emoji> - Change your avatar.
/clear - Clear chat history from display and local storage.
/theme <theme_name> - Change theme (light, dark, oled-black, crt).
/me <action> - Perform an action (e.g., /me is happy).
/whoami - Display your current user information.
/roll [NdN] - Roll dice (e.g., /roll 2d6, /roll d20).
/random [max] or /random [min] [max] - Generate a random number.
/flip - Flip a coin.
/help - Show this help message.`;
        displaySystemMessage(helpText, 'info');
    }

    function displaySystemMessage(text, type = 'info') {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'system-message'); // Add 'message' for some base styling if desired

        if (type === 'error') {
            msgDiv.classList.add('system-error');
        } else if (type === 'success') {
            msgDiv.classList.add('system-success');
        } else if (type === 'emote') {
            msgDiv.classList.add('system-emote');
        }
        // Default to 'system-info' if type is unrecognized or 'info'
        else {
            msgDiv.classList.add('system-info');
        }

        const textNode = document.createElement('p');
        textNode.textContent = text;

        // Apply italics only if not an emote
        if (type !== 'emote') {
            textNode.style.fontStyle = 'italic';
        }

        msgDiv.appendChild(textNode);
        messageDisplay.appendChild(msgDiv);
        messageDisplay.scrollTop = messageDisplay.scrollHeight; // Scroll to bottom
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

    // Theme Switching Logic
    const themeSelector = document.getElementById('theme-selector');
    const LOCAL_STORAGE_THEME_KEY = 'chatTheme';

    function applyTheme(themeName) {
        document.body.classList.remove('theme-dark', 'theme-oled-black', 'theme-crt');
        // 'light' theme is default (no class)
        if (themeName && themeName !== 'light') {
            document.body.classList.add(`theme-${themeName}`);
        }
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, themeName);
        if (themeSelector) {
            themeSelector.value = themeName;
        }
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || 'light'; // Default to light
        applyTheme(savedTheme);
    }

    if (themeSelector) {
        themeSelector.addEventListener('change', (event) => {
            applyTheme(event.target.value);
        });
    }

    // Load theme on initial page load
    loadTheme();

    // --- Utility Functions ---
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    // --- End Utility Functions ---

    console.log("Chat script loaded. Current user:", currentUser);
});
