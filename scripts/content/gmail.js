//requires MESSAGE_BUS, CONFIG_STORE

const initInboxSdk = () => {
  return new Promise((resolve) => {
    InboxSDK.load(2, 'sdk_a628b78da5fe4c0_703312c6e0').then(function (sdk) {
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
      if (cfg.embedButton === 'true') {
        sdk.Toolbars.registerThreadButton({
          title: 'Add to Todoist',
          positions: ['THREAD'],
          iconUrl: 'https://d3ptyyxy2at9ui.cloudfront.net/gmail-plugin-todoist-icon-v1.svg',
          onClick: function () {
            top.MESSAGE_BUS.TO_BACKEND.createTask(taskDefinition);
          }
        });
      }
    });
};

const registerBackendMessageBus = () => {
  return new Promise((resolve) => {
    chrome.runtime.onMessage.addListener(() => {
      let messageBus = top.MESSAGE_BUS.TO_BACKEND;
      if (taskDefinition) {
        messageBus.createTask(taskDefinition);
      } else {
        messageBus.showNotification({
          iconUrl: 'images/info-icon-128.png',
          title: 'Cannot create Todoist task',
          message: 'Please open an email detail first'
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