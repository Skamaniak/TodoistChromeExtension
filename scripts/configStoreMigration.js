// LOGGER
const DEFAULT_TODOIST_PRIORITY = 1;
const JIRA_PRIORITY_MAPPING = {
  'Trivial': DEFAULT_TODOIST_PRIORITY,
  'Minor': DEFAULT_TODOIST_PRIORITY,
  'Major': DEFAULT_TODOIST_PRIORITY,
  'Critical': DEFAULT_TODOIST_PRIORITY,
  'Blocker': DEFAULT_TODOIST_PRIORITY
};

const SCHEDULE_OPTIONS = ['Today', 'Tomorrow', 'Next week'];
const KNOWN_VERSIONS = ["1.1.2", "1.1.3"];

class Migration {
  static migrateStringToBoolean(object, property) {
    const oldValue = object[property];
    if (typeof oldValue === 'string') {
      object[property] = oldValue === 'true';
    }
  }

  static migrate(oldConfig) {
    if (!oldConfig.version) {
      const latestVersion = Migration.getLatestConfigVersion();
      top.LOGGER.info("Config migration: Adding 'version'", latestVersion);
      oldConfig.version = latestVersion;
    }
    if (!oldConfig.popup.scheduleOptions) {
      oldConfig.popup.scheduleOptions = defaultConfig.popup.scheduleOptions;
    }
    if (!oldConfig.popup.scheduleEnabled) {
      oldConfig.popup.scheduleEnabled = defaultConfig.popup.scheduleEnabled;
    }

    Migration.migrateStringToBoolean(oldConfig.popup, 'scheduleEnabled');
    Migration.migrateStringToBoolean(oldConfig.gmail, 'embedButton');
    Migration.migrateStringToBoolean(oldConfig.jira, 'priorityMappingEnabled');

    const latestConfigVersion = Migration.getLatestConfigVersion();
    if (!oldConfig.version !== latestConfigVersion) {
      oldConfig.version = latestConfigVersion;
    }
    return oldConfig;
  }

  static getLatestConfigVersion() {
    return KNOWN_VERSIONS[KNOWN_VERSIONS.length - 1];
  }
}

const defaultConfig = {
  version: Migration.getLatestConfigVersion(),
  todoist: {
    todoistApiKey: ''
  },
  popup: {
    timeoutMs: 2000,
    scheduleOptions: SCHEDULE_OPTIONS,
    scheduleEnabled: true
  },
  gmail: {
    taskTemplate: '$message [$subject ($source)]($href)',
    embedButton: true,
    regexIdentifier: '^https:\\/\\/mail\\.google\\.com'
  },
  confluence: {
    taskTemplate: '$message [$title ($source)]($href)',
    regexIdentifier: '^https:\\/\\/[^.]+\\.atlassian\\.net\\/wiki\\/'
  },
  jira: {
    taskTemplate: '$message [$summary ($source)]($href)',
    priorityMappingEnabled: false,
    priorityMapping: JIRA_PRIORITY_MAPPING,
    regexIdentifier: '^https:\\/\\/[^.]+\\.atlassian\\.net\\/'
  },
  website: {
    taskTemplate: '$message [$title ($source)]($href)',
    regexIdentifier: '.*'
  }
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.get('configuration', function (response) {
    const oldConfig = response.configuration;
    let configuration;
    if (!oldConfig) {
      top.LOGGER.info("Configuration not found, setting up defaults for version", defaultConfig.version);
      configuration = defaultConfig;
    } else {
      configuration = Migration.migrate(oldConfig);
    }
    chrome.storage.sync.set({configuration});
  });
});

// export
top.DEFAULTS = top.DEFAULTS || {};
top.DEFAULTS.DEFAULT_TODOIST_PRIORITY = DEFAULT_TODOIST_PRIORITY;