const formatEmailTask = (taskDefinition) => {
    return top.CONFIG_STORE.loadConfigSection("gmail")
        .then((config) => {
            return config.taskTemplate
                .replace("$subject", taskDefinition.subject)
                .replace("$source", taskDefinition.source)
                .replace("$senderName", taskDefinition.senderName)
                .replace("$senderEmailAddress", taskDefinition.senderEmailAddress)
                .replace("$href", taskDefinition.href);
        });
};

const formatConfluenceTask = (taskDefinition) => {
    return top.CONFIG_STORE.loadConfigSection("confluence")
        .then((config) => {
            return config.taskTemplate
                .replace("$title", taskDefinition.title)
                .replace("$source", taskDefinition.source)
                .replace("$href", taskDefinition.href);
        });
};

const formatJiraTask = (taskDefinition) => {
    return top.CONFIG_STORE.loadConfigSection("jira")
        .then((config) => {
            return config.taskTemplate
                .replace("$summary", taskDefinition.summary)
                .replace("$source", taskDefinition.source)
                .replace("$href", taskDefinition.href)
                .replace("$issueType", taskDefinition.issueType)
                .replace("$reporter", taskDefinition.reporter)
                .replace("$assignee", taskDefinition.assignee)
                .replace("$priority", taskDefinition.priority)
                .replace("$status", taskDefinition.status);
        });
};

const formatWebsiteTask = (taskDefinition) => {
    return top.CONFIG_STORE.loadConfigSection("website")
        .then((config) => {
            return config.taskTemplate
                .replace("$title", taskDefinition.title)
                .replace("$source", taskDefinition.source)
                .replace("$href", taskDefinition.href);
        });
};

const formatters = {
    "Email": (taskDefinition) => formatEmailTask(taskDefinition),
    "Confluence": (taskDefinition) => formatConfluenceTask(taskDefinition),
    "Jira": (taskDefinition) => formatJiraTask(taskDefinition),
    "Website": (taskDefinition) => formatWebsiteTask(taskDefinition)
};

// export
top.TASK_FORMATTER = top.TASK_FORMATTER || {};
top.TASK_FORMATTER.toTodoistTask = (taskDefinition) => {
    const formatter = formatters[taskDefinition.source];
    return formatter(taskDefinition);
};

