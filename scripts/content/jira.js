const scrapeJiraTicketInfo = () => {
    const summaryElement = document.querySelector("#summary-val");
    const issueKeyElement = document.querySelector("#key-val");
    if (summaryElement && issueKeyElement) {
        return {
            source: "Jira",
            title: summaryElement.textContent,
            href: issueKeyElement.href
        };
    }
    return null;
};

chrome.runtime.onMessage.addListener(() => {
    let messageBus = top.MESSAGE_BUS.TO_BACKEND;
    const taskDefinition = scrapeJiraTicketInfo();

    if (taskDefinition) {
        messageBus.createTask(taskDefinition);
    } else {
        messageBus.actionCurrentlyUnavailable();
    }
});