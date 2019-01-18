// requires LOGGER

class MessagBus {
  sendMessageToBackend (action, payload) {
    top.LOGGER.debug('Sending action', action, 'with payload', payload, 'to backend');
    chrome.runtime.sendMessage({ action, payload });
  };

  sendMessageToFrontend (action) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      top.LOGGER.debug('Sending action', action, 'to frontend tab', tabId);
      chrome.tabs.sendMessage(tabId, action);
    });
  };
}

// export
const messageBus = new MessagBus();
const actions = {
  createTask: 'CREATE_TASK',
  actionCurrentlyUnavailable: 'ACTION_CURRENTLY_UNAVAILABLE',
  injectContentScripts: 'INJECT_CONTENT_SCRIPTS'
};

top.MESSAGE_BUS = top.MESSAGE_BUS || {};
top.MESSAGE_BUS.ACTIONS = actions;

top.MESSAGE_BUS.TO_BACKEND = top.MESSAGE_BUS.TO_BACKEND || {};
top.MESSAGE_BUS.TO_BACKEND.createTask = (taskDefinition) => messageBus.sendMessageToBackend(actions.createTask, taskDefinition);
top.MESSAGE_BUS.TO_BACKEND.actionCurrentlyUnavailable = () => messageBus.sendMessageToBackend(actions.actionCurrentlyUnavailable);
top.MESSAGE_BUS.TO_BACKEND.injectContentScripts = () => messageBus.sendMessageToBackend(actions.injectContentScripts);

top.MESSAGE_BUS.TO_FRONTEND = top.MESSAGE_BUS.TO_FRONTEND || {};
top.MESSAGE_BUS.TO_FRONTEND.createTask = () => messageBus.sendMessageToFrontend(actions.createTask);
