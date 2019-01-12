const defaultConfig = {
    todoist: {
        todoistApiKey: ""
    },
    gmail: {
        taskTemplate: "[$subject ($source)]($href)"
    },
    confluence: {
        taskTemplate: "[$title ($source)]($href)"
    },
    jira: {
        taskTemplate: "[$summary ($source)]($href)"
    },
    website: {
        taskTemplate: "[$title ($source)]($href)"
    }
};

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({configuration: defaultConfig});
});


top.CONFIG_STORE = top.CONFIG_STORE || {};
top.CONFIG_STORE.loadConfig = () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get('configuration', function (response) {
            resolve(response.configuration);
        });
    })
};

top.CONFIG_STORE.loadConfigSection = (section) => {
    return top.CONFIG_STORE.loadConfig()
        .then((configuration) => configuration[section])
};

top.CONFIG_STORE.storeConfig = (configuration) => {
    return new Promise((resolve) => {
        chrome.storage.sync.set({configuration}, function () {
            resolve();
        })
    })
};
