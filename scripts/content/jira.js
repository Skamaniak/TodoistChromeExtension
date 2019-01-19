// requires MESSAGE_BUS

const scrapeJiraTicketInfo = () => {
    const summaryElement = document.getElementById("summary-val");
    const issueKeyElement = document.getElementById("key-val");
    const typeElement = document.getElementById("type-val");
    const assigneeElement = document.getElementById("assignee-val");
    const reporterElement = document.getElementById("reporter-val");
    const priorityElement = document.getElementById("priority-val");
    const statusElement = document.getElementById("status-val");

    if (summaryElement && issueKeyElement
        && typeElement && assigneeElement
        && reporterElement && priorityElement
        && statusElement) {

        return {
            source: "Jira",
            summary: summaryElement.textContent,
            href: issueKeyElement.href,
            issueType: typeElement.textContent.trim(),
            assignee: assigneeElement.textContent.trim(),
            reporter: reporterElement.textContent.trim(),
            priority: priorityElement.textContent.trim(),
            status: statusElement.textContent.trim()
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
      messageBus.showNotification({
        iconUrl: "images/info-icon-128.png",
        title: "Cannot create Todoist task",
        message: "Please open a Jira issue first"
      });
    }
});