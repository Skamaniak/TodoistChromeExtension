const createTask = (taskDefinition) => {
    top.PLUGIN_ICON.signalLoading();
    top.TASK_FORMATTER.toTodoistTask(taskDefinition)
        .then((task) => top.TODOIST_CLIENT.createTask(task))
        .then(() => top.PLUGIN_ICON.signalSuccess())
        .catch((error) => {
            top.PLUGIN_ICON.signalFailure();
            AlertManager.showError(error);
        });
};

const actionHandlers = {
    "CREATE_TASK": createTask,
    "ACTION_CURRENTLY_UNAVAILABLE": () => top.PLUGIN_ICON.signalFailure()
};

chrome.runtime.onMessage.addListener(function (request) {
    const handler = actionHandlers[request.action];
    handler(request.payload);
});

chrome.browserAction.onClicked.addListener(function () {
    top.MESSAGE_BUS.TO_FRONTEND.createTask();
});