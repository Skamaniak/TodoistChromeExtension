const API_KEY_ID = 'todoistApiKey';
const SAVE_BUTTON_ID = 'saveApiKeyButton';
const RESPONSE_TEXT_ID = 'responseText';

let currentTimeout;
const showTokenSaved = () => {
    const responseTextElem = document.getElementById(RESPONSE_TEXT_ID);
    responseTextElem.textContent = "Token Saved!";
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }
    currentTimeout = setTimeout(() => responseTextElem.textContent = "", 2000)
};

window.onload = function () {
    document.getElementById(SAVE_BUTTON_ID).onclick = () => {
        const apiKey = document.getElementById(API_KEY_ID).value;
        chrome.storage.sync.set({todoistApiKey: apiKey}, function() {
            showTokenSaved();
        })
    };
};
