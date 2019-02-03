//requires MESSAGE_BUS

const scrapeConfluencePageInfo = () => {
  const pageTitleElement = document.getElementById('title-text');
  if (pageTitleElement) {
    return {
      source: 'Confluence',
      title: pageTitleElement.textContent,
      href: top.location.href
    };
  }
  return null;
};

chrome.runtime.onMessage.addListener((_1, _2, sendResponse) => {
  const taskDefinition = scrapeConfluencePageInfo();

  if (taskDefinition) {
    sendResponse({
      success: true,
      taskDefinition
    });
  } else {
    const notification = {
      iconUrl: 'images/info-icon-128.png',
      title: 'Cannot create Todoist task',
      message: 'Please navigate to some Confluence page first'
    };

    sendResponse({
      success: false,
      notification
    });
  }
});