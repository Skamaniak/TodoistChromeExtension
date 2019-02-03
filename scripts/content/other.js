// requires MESSAGE_BUS

const scrapeGenericPageInfo = () => {
  const pageTitleElem = document.querySelector('title');
  const pageTitle = pageTitleElem ? pageTitleElem.textContent : 'No Page Title';
  return {
    source: 'Website',
    title: pageTitle.trim(),
    href: top.location.href
  };
};

chrome.runtime.onMessage.addListener((_1, _2, sendResponse) => {
  const taskDefinition = scrapeGenericPageInfo();

  sendResponse({
    success: true,
    taskDefinition
  });
});