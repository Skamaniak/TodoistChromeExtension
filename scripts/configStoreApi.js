// export
top.CONFIG_STORE = top.CONFIG_STORE || {};
top.CONFIG_STORE.loadConfig = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('configuration', function (response) {
      resolve(response.configuration);
    });
  });
};

top.CONFIG_STORE.loadConfigSection = (section) => {
  return top.CONFIG_STORE.loadConfig()
    .then((configuration) => configuration ? configuration[section] : {});
};

top.CONFIG_STORE.storeConfig = (configuration) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ configuration }, function () {
      resolve();
    });
  });
};

top.CONFIG_STORE.addOnConfigChangeListener = (listener) => {
  chrome.storage.onChanged.addListener(function (changes) {
    const change = changes['configuration'];
    if (change) {
      listener(change.newValue, change.oldValue);
    }
  });
};

top.CONFIG_STORE.loadProjectsState = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('projectsState', function (response) {
      if (response && response.projectsState) {
        resolve(response.projectsState);
      } else {
        resolve({});
      }
    });
  });
};

top.CONFIG_STORE.storeProjectsState = (projectsState) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({projectsState}, function () {
      resolve();
    });
  });
};