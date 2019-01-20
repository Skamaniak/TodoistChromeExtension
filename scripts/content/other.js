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

chrome.runtime.onMessage.addListener(() => {
  let messageBus = top.MESSAGE_BUS.TO_BACKEND;
  const taskDefinition = scrapeGenericPageInfo();
  messageBus.createTask(taskDefinition);
});