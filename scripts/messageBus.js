const sendMessageToBackend = (action, payload) => {
    chrome.runtime.sendMessage({
        action, payload
    });
};

const sendMessageToFrontend = (action) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, action);
    });
};

// export
top.MESSAGE_BUS = top.MESSAGE_BUS || {};

top.MESSAGE_BUS.TO_BACKEND = top.MESSAGE_BUS.TO_BACKEND || {};
top.MESSAGE_BUS.TO_BACKEND.createTask = (taskDefinition) => sendMessageToBackend("CREATE_TASK", taskDefinition);
top.MESSAGE_BUS.TO_BACKEND.actionCurrentlyUnavailable = () => sendMessageToBackend("ACTION_CURRENTLY_UNAVAILABLE");

top.MESSAGE_BUS.TO_FRONTEND = top.MESSAGE_BUS.TO_FRONTEND || {};
top.MESSAGE_BUS.TO_FRONTEND.createTask = () => sendMessageToFrontend("CREATE_TASK");