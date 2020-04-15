//requires MESSAGE_BUS, CONFIG_STORE

const initInboxSdk = () => {
  return new Promise((resolve) => {
    InboxSDK.load(2, 'sdk_a628b78da5fe4c0_703312c6e0') // eslint-disable-line no-undef
      .then(function (sdk) {
        resolve(sdk);
      });
  });
};

let taskDefinition;
const registerMessageViewHandler = (sdk) => {
  return new Promise((resolve) => {
    sdk.Conversations.registerMessageViewHandler(function (message_view) {
      const thread_view = message_view.getThreadView();
      const sender = message_view.getSender();
      taskDefinition = {
        source: 'Email',
        subject: thread_view.getSubject(),
        href: top.location.href,
        senderName: sender.name,
        senderEmailAddress: sender.emailAddress
      };
      message_view.on('destroy', function () {
        taskDefinition = null;
      });
      resolve(sdk);
    });
  });
};

const addTodoistButton = (sdk) => {
  return top.CONFIG_STORE.loadConfigSection('gmail')
    .then((cfg) => {
      if (cfg.embedButton) {
        sdk.Toolbars.registerThreadButton({
          title: 'Add to Todoist',
          positions: ['THREAD'],
          iconUrl: 'https://github.com/Skamaniak/TodoistChromeExtension/blob/master/images/plugin-icon-32.png?raw=true',
          onClick: function () {
            top.MESSAGE_BUS.TO_BACKEND.createTask(taskDefinition);
          }
        });
      }
    });
};

const registerBackendMessageBus = () => {
  return new Promise((resolve) => {
    chrome.runtime.onMessage.addListener((_1, _2, sendResponse) => {
      if (taskDefinition) {
        sendResponse({
          success: true,
          taskDefinition
        });
      } else {
        const notification = {
          iconUrl: 'images/info-icon-128.png',
          title: 'Cannot create Todoist task',
          message: 'Please open an email detail first'
        };
        sendResponse({
          success: false,
          notification
        });
      }
    });
    resolve();
  });
};

registerBackendMessageBus()
  .then(initInboxSdk)
  .then(registerMessageViewHandler)
  .then(addTodoistButton);