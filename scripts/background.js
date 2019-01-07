chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'mail.google.com'}
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});


const createTodoistTask = (task, apiKey) => {
    const taskDefinition = {
        "content": "[" + task.text + "](" + task.link + ")"
    };

    const request = new XMLHttpRequest();
    request.open("POST", "https://beta.todoist.com/API/v8/tasks", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Bearer " + apiKey);

    request.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
            alert("Failed to save task to Todoist, response code was " + this.status);
        }
    };

    request.send(JSON.stringify(taskDefinition));
};

chrome.runtime.onMessage.addListener(function (request) {
    createTodoistTask(request.task, request.apiKey);
});