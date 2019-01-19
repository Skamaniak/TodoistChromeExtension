// requires LOGGER

class ContentScriptInjector {
  _injectContentScript (tabId, fileName) {
    return new Promise((resolve) => {
      chrome.tabs.executeScript(tabId, { file: fileName }, resolve);
    });
  };

  _injectContentScripts (tabId, fileNames) {
    let pipeline = Promise.resolve();
    fileNames.forEach((fileName) => {
      pipeline = pipeline.then(() => this._injectContentScript(tabId, fileName));
    });
    return pipeline;
  };

  _injectGmailContentScripts (url, tabId) {
    const shouldInject = url.startsWith('https://mail.google.com');
    if (shouldInject) {
      top.LOGGER.debug('Loading gmail scripts for', url);
      this._injectContentScripts(tabId, [
        'scripts/configStoreApi.js',
        'scripts/lib/inboxsdk.js',
        'scripts/content/gmail.js'
      ]);
    }
    return shouldInject;
  };

  _injectJiraContentScripts (url, tabId) {
    const shouldInject = url.match(/https:\/\/snappli\.atlassian\.net\//);
    if (shouldInject) {
      top.LOGGER.debug('Loading jira scripts for', url);
      this._injectContentScripts(tabId, [
        'scripts/content/jira.js'
      ]);
    }
    return shouldInject;
  };

  _injectConfluenceContentScript (url, tabId) {
    const shouldInject = url.startsWith('https://snappli.atlassian.net/wiki');
    if (shouldInject) {
      top.LOGGER.debug('Loading confluence scripts for', url);
      this._injectContentScripts(tabId, [
        'scripts/content/confluence.js'
      ]);
    }
    return shouldInject;
  };

  _injectGenericWebsiteContentScript (url, tabId) {
    top.LOGGER.debug('Loading generic scripts for', url);
    this._injectContentScripts(tabId, [
      'scripts/content/other.js'
    ]);
    return true;
  };

  injectContentScripts (url, tabId) {
    // Order matters!
    this._injectGmailContentScripts(url, tabId) ||
    this._injectConfluenceContentScript(url, tabId) ||
    this._injectJiraContentScripts(url, tabId) ||
    this._injectGenericWebsiteContentScript(url, tabId);
  };
}

// Export
top.CONTENT_SCRIPT_INJECTOR = new ContentScriptInjector();