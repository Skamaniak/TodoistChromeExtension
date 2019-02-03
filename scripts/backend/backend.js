// requires LOGGER, MESSAGE_BUS, PLUGIN_ICON, TASK_FORMATTER, TODOIST_CLIENT, TODOIST_PROJECT_PROVIDER, CONTENT_SCRIPT_INJECTOR, NOTIFICATION_MANAGER

let userActionTimerContext;
const actionHandlers = {};

const createTask = (taskDefinition) => {
  clearTimeout(userActionTimerContext);
  top.MESSAGE_BUS.TO_POPUP.closePopup();
  top.PLUGIN_ICON.signalLoading();
  top.TASK_FORMATTER.toTodoistTask(taskDefinition)
    .then((task) => top.TODOIST_CLIENT.createTask(task))
    .then(() => top.PLUGIN_ICON.signalSuccess())
    .catch((error) => {
      top.LOGGER.error('Request to Todoist failed with error', error);
      top.PLUGIN_ICON.signalFailure();
      top.NOTIFICATION_MANAGER.alert(error);
    });
};

const scheduleTaskCreation = function (response) {
  top.PLUGIN_ICON.signalWaiting();
  top.CONFIG_STORE.loadConfigSection('popup')
    .then((popup) => {
      userActionTimerContext = setTimeout(() => {
        top.LOGGER.debug('Creating scheduled task...');
        top.PLUGIN_ICON.clearSignal();
        top.MESSAGE_BUS.TO_POPUP.closePopup();
        createTask(response.taskDefinition);
      }, popup.timeoutMs);
      top.LOGGER.debug('Task creation scheduled');
    });
};

const fetchProjects = () => {
  const response = top.TODOIST_PROJECT_PROVIDER.getProjects();
  if (!response.success) {
    top.PLUGIN_ICON.signalInfo();
    top.NOTIFICATION_MANAGER.announce({
      iconUrl: 'images/info-icon-128.png',
      title: 'Cannot create Todoist task',
      message: 'Please configure a valid API key first'
    });
  }
  return response;
};

// Backend actions
actionHandlers[top.MESSAGE_BUS.ACTIONS.createTask] = createTask;
actionHandlers[top.MESSAGE_BUS.ACTIONS.injectContentScripts] = (_, sender) =>
  top.CONTENT_SCRIPT_INJECTOR.injectContentScripts(sender.url, sender.tab.id);

actionHandlers[top.MESSAGE_BUS.ACTIONS.scheduleTaskCreation] = () => {
  clearTimeout(userActionTimerContext);
  top.MESSAGE_BUS.TO_FRONTEND.createTask((taskCreationResponse) => {
    const fetchProjectsResponse = fetchProjects();
    if (taskCreationResponse && taskCreationResponse.success && fetchProjectsResponse.success) {
      const popupData = {
        projects: fetchProjectsResponse.projects,
        taskDefinition: taskCreationResponse.taskDefinition
      };
      top.MESSAGE_BUS.TO_POPUP.popupData(popupData);
      scheduleTaskCreation(taskCreationResponse);
    } else {
      top.MESSAGE_BUS.TO_POPUP.closePopup();
      top.PLUGIN_ICON.signalInfo();
      if (taskCreationResponse && taskCreationResponse.notification) {
        top.NOTIFICATION_MANAGER.announce(taskCreationResponse.notification);
      }
    }
  });
};

actionHandlers[top.MESSAGE_BUS.ACTIONS.cancelScheduledTaskCreation] = () => {
  top.LOGGER.debug('Task cancelled');
  top.PLUGIN_ICON.clearSignal();
  clearTimeout(userActionTimerContext);
};

// Action Listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.destination === 'BACKEND') {
    top.LOGGER.debug('Backend received message', request);
    const handler = actionHandlers[request.action];
    handler(request.payload, sender, sendResponse);
  }
});