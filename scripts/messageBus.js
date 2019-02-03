// requires LOGGER

class MessagBus {
  _sendMessageToPluginScript(action, payload, listener, destination) {
    top.LOGGER.debug('Sending action', action, 'with payload', payload, 'to', destination);
    chrome.runtime.sendMessage({ action, payload, destination }, listener);
  }

  sendMessageToBackend (action, payload, listener) {
    this._sendMessageToPluginScript(action, payload, listener, 'BACKEND');
  };

  sendMessageToPopup (action, payload, listener) {
    this._sendMessageToPluginScript(action, payload, listener, 'POPUP');
  };

  sendMessageToFrontend (action, payload, listener) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      top.LOGGER.debug('Sending action', action, 'to frontend tab', tabId);
      chrome.tabs.sendMessage(tabId, { action, payload }, listener);
    });
  };
}

// export
const messageBus = new MessagBus();
const actions = {
  createTask: 'CREATE_TASK',
  injectContentScripts: 'INJECT_CONTENT_SCRIPTS',
  scheduleTaskCreation: 'SCHEDULE_TASK_CREATION',
  cancelScheduledTaskCreation: 'CANCEL_SCHEDULED_TASK_CREATION',
  closePopup: 'CLOSE_POPUP',
  popupData: 'POPUP_DATA'
};

top.MESSAGE_BUS = top.MESSAGE_BUS || {};
top.MESSAGE_BUS.ACTIONS = actions;

top.MESSAGE_BUS.TO_BACKEND = top.MESSAGE_BUS.TO_BACKEND || {};
top.MESSAGE_BUS.TO_BACKEND.createTask =
  (taskDefinition) => messageBus.sendMessageToBackend(actions.createTask, taskDefinition);
top.MESSAGE_BUS.TO_BACKEND.injectContentScripts =
  () => messageBus.sendMessageToBackend(actions.injectContentScripts);

top.MESSAGE_BUS.TO_BACKEND.scheduleTaskCreation =
  (listener) => messageBus.sendMessageToBackend(actions.scheduleTaskCreation, null, listener);
top.MESSAGE_BUS.TO_BACKEND.cancelScheduledTaskCreation =
  () => messageBus.sendMessageToBackend(actions.cancelScheduledTaskCreation);
top.MESSAGE_BUS.TO_FRONTEND = top.MESSAGE_BUS.TO_FRONTEND || {};

top.MESSAGE_BUS.TO_FRONTEND.createTask =
  (listener) => messageBus.sendMessageToFrontend(actions.createTask, null, listener);
top.MESSAGE_BUS.TO_POPUP = top.MESSAGE_BUS.TO_POPUP || {};

top.MESSAGE_BUS.TO_POPUP.closePopup =
  () => messageBus.sendMessageToPopup(actions.closePopup);
top.MESSAGE_BUS.TO_POPUP.popupData =
  (data) => messageBus.sendMessageToPopup(actions.popupData, data);
