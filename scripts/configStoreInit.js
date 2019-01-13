const defaultConfig = {
    todoist: {
        todoistApiKey: ""
    },
    gmail: {
        taskTemplate: "[$subject ($source)]($href)",
        embedButton: "true"
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