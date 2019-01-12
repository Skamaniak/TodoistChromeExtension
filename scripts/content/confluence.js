const scrapeConfluencePageInfo = () => {
    const pageTitleElement = document.getElementById("title-text");
    if (pageTitleElement) {
        return {
            source: "Confluence",
            title: pageTitleElement.textContent,
            href: top.location.href
        };
    }
    return null;
};

chrome.runtime.onMessage.addListener(() => {
    let messageBus = top.MESSAGE_BUS.TO_BACKEND;
    const taskDefinition = scrapeConfluencePageInfo();

    if (taskDefinition) {
        messageBus.createTask(taskDefinition);
    } else {
        messageBus.actionCurrentlyUnavailable();
    }
});