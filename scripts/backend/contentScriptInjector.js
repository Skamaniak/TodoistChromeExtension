// requires LOGGER, CONFIG_STORE

class ContentScriptInjector {

  constructor (gmailUrlRegex, confluenceUrlRegex, jiraUrlRegex, genericWebsiteUrlRegex) {
    const gmailInjector = {
      'urlRegex': gmailUrlRegex,
      'scripts': ['scripts/configStoreApi.js', 'scripts/lib/inboxsdk.js', 'scripts/content/gmail.js']
    };

    const confluenceInjector = {
      'urlRegex': confluenceUrlRegex,
      'scripts': ['scripts/content/confluence.js']
    };

    const jiraInjector = {
      'urlRegex': jiraUrlRegex,
      'scripts': ['scripts/content/jira.js']
    };

    const genericWebsiteInjector = {
      'urlRegex': genericWebsiteUrlRegex,
      'scripts': ['scripts/content/other.js']
    };

    this.orderedInjectors = [gmailInjector, confluenceInjector, jiraInjector, genericWebsiteInjector];
  }

  static fromConfig (config) {
    const gmailUrlRegex = new RegExp(config.gmail.regexIdentifier);
    const confluenceUrlRegex = new RegExp(config.confluence.regexIdentifier);
    const jiraUrlRegex = new RegExp(config.jira.regexIdentifier);
    const genericWebsiteUrlRegex = new RegExp(config.website.regexIdentifier);
    return new ContentScriptInjector(gmailUrlRegex, confluenceUrlRegex, jiraUrlRegex, genericWebsiteUrlRegex);
  }

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

  injectContentScripts (url, tabId) {
    for (const injector of this.orderedInjectors) {
      if (url.match(injector.urlRegex)) {
        top.LOGGER.debug('Injecting scripts', injector.scripts, 'into', url);
        this._injectContentScripts(tabId, injector.scripts);
        break;
      }
    }
  };
}

// export
// Create from configuration and then reload on config change
top.CONFIG_STORE.loadConfig()
  .then((config) => {
    if (config) {
      top.CONTENT_SCRIPT_INJECTOR = ContentScriptInjector.fromConfig(config);
      top.LOGGER.debug('Content script injector initialized');
    }
  });
top.CONFIG_STORE.addOnConfigChangeListener((newConfig) => {
  top.CONTENT_SCRIPT_INJECTOR = ContentScriptInjector.fromConfig(newConfig);
  top.LOGGER.debug('Content script injector reinitialized on config change');
});