
let currentTimeout;
const showConfigSaved = () => {
    const responseTextElem = document.getElementById("responseText");
    responseTextElem.textContent = "Configuration successfully saved";
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }
    currentTimeout = setTimeout(() => responseTextElem.textContent = "", 2000)
};

window.onload = () => {
    const ELEMS = {
        ACTIONS: {
            save: document.getElementById("saveButton")
        },
        TODOIST: {
            apiKey: document.getElementById("todoistApiKey")
        },
        GMAIL: {
            taskTemplate: document.getElementById("gmailTaskTemplate")
        },
        CONFLUENCE: {
            taskTemplate: document.getElementById("confluenceTaskTemplate")
        },
        JIRA: {
            taskTemplate: document.getElementById("jiraTaskTemplate")
        },
        WEBSITE: {
            taskTemplate: document.getElementById("websiteTaskTemplate")
        }
    };

    top.CONFIG_STORE.loadConfig()
        .then((config) => {
            ELEMS.TODOIST.apiKey.value = config.todoist.todoistApiKey;
            ELEMS.GMAIL.taskTemplate.value = config.gmail.taskTemplate;
            ELEMS.CONFLUENCE.taskTemplate.value = config.confluence.taskTemplate;
            ELEMS.JIRA.taskTemplate.value = config.jira.taskTemplate;
            ELEMS.WEBSITE.taskTemplate.value = config.website.taskTemplate;
        });

    ELEMS.ACTIONS.save.onclick = () => {
        const config = {
            todoist: {
                todoistApiKey: ELEMS.TODOIST.apiKey.value
            },
            gmail:{
                taskTemplate: ELEMS.GMAIL.taskTemplate.value
            },
            confluence: {
                taskTemplate: ELEMS.CONFLUENCE.taskTemplate.value
            },
            jira: {
                taskTemplate: ELEMS.JIRA.taskTemplate.value
            },
            website: {
                taskTemplate: ELEMS.WEBSITE.taskTemplate.value
            }
        };
        top.CONFIG_STORE.storeConfig(config)
            .then(() => showConfigSaved())
    }
};
