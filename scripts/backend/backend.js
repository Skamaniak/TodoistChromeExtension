// requires LOGGER, MESSAGE_BUS, PLUGIN_ICON, TASK_FORMATTER, TODOIST_CLIENT, CONTENT_SCRIPT_INJECTOR

const createTask = (taskDefinition) => {
  top.PLUGIN_ICON.signalLoading();
  top.TASK_FORMATTER.toTodoistTask(taskDefinition)
    .then((task) => top.TODOIST_CLIENT.createTask(task))
    .then(() => top.PLUGIN_ICON.signalSuccess())
    .catch((error) => {
      top.LOGGER.error("Request to Todoist failed with error", error);
      top.PLUGIN_ICON.signalFailure();
      AlertManager.showError(error);
    });
};

const actionHandlers = {};
actionHandlers[top.MESSAGE_BUS.ACTIONS.createTask] = createTask;
actionHandlers[top.MESSAGE_BUS.ACTIONS.actionCurrentlyUnavailable] = () => top.PLUGIN_ICON.signalFailure();
actionHandlers[top.MESSAGE_BUS.ACTIONS.injectContentScripts] = (_, sender) =>
  top.CONTENT_SCRIPT_INJECTOR.injectContentScripts(sender.url, sender.tab.id);


chrome.runtime.onMessage.addListener(function (request, sender) {
  top.LOGGER.debug("Backend received message", request);
  const handler = actionHandlers[request.action];
  handler(request.payload, sender);
});

chrome.browserAction.onClicked.addListener(function () {
  top.LOGGER.debug("Plugin icon clicked");
  top.MESSAGE_BUS.TO_FRONTEND.createTask();
});