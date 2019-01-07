const reportError = (err) => {
  alert(err);
};

const createTask = (task, apiKey) => {
    alert(apiKey);
    if (!apiKey) {
        reportError('Todoist API token is not set.');
    } else if (!task) {
        reportError("Received task definition is invalid and cannot be sent to Todoist.")
    } else {
        chrome.runtime.sendMessage({task, apiKey});
    }
};

const sendActionToActiveTab = (action, responseHandler) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, action, responseHandler);
    });
};

const starEmail = () => {
    const responseHandler = (task) => {
        chrome.storage.sync.get('todoistApiKey', function(apiKey) {
            createTask(task, apiKey.todoistApiKey);
        });
    };

    sendActionToActiveTab({action: "createTask"}, responseHandler);
};

window.onload = function () {
    document.getElementById('newTask').onclick = () => starEmail();
};

