const STAR_BUTTON_SELECTOR = 'div[title="Není označeno hvězdičkou"]';
const TEXT_SELECTOR = 'h2[data-legacy-thread-id]';
const TYPE = "gmail";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const response = {
        type: TYPE,
        text: document.querySelector(TEXT_SELECTOR).textContent,
        link: window.location.href,
        created: false
    };

    const starButton = document.querySelector(STAR_BUTTON_SELECTOR);
    if (starButton) {
        document.querySelector(STAR_BUTTON_SELECTOR).click();
        response.created = true;
    }
    sendResponse(response);
});