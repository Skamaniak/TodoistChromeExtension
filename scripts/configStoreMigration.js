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
const KNOWN_VERSIONS = ['1.1.2', '1.3.0'];

class Migration {

  static _logConfigMigration(msg) {
    top.LOGGER.info('Config migration: ' + msg);
  }

  static _migrateStringToBoolean(object, property) {
    const oldValue = object[property];
    if (typeof oldValue === 'string') {
      Migration._logConfigMigration('Changing type from string to boolean for \'' + property + '\'');
      object[property] = oldValue === 'true';
    }
  }

  static _addProperty(config, property, value) {
    if (!config[property]) {
      Migration._logConfigMigration('Adding \'' + property + '\'');
      config[property] = value;
    }
  }

  static _updateConfigVersion(config) {
    const latestConfigVersion = Migration._getLatestConfigVersion();
    if (config.version !== latestConfigVersion) {
      Migration._logConfigMigration('Changing config version from \'' + config.version + ' to \'' +
        latestConfigVersion + '\'');
      config.version = latestConfigVersion;
    }
  }

  static _getLatestConfigVersion() {
    return KNOWN_VERSIONS[KNOWN_VERSIONS.length - 1];
  }

  static migrate(oldConfig) {
    // pre 1.1.2 to 1.1.2
    Migration._addProperty(oldConfig, 'version', Migration._getLatestConfigVersion());

    // 1.1.2 to 1.3.0
    Migration._addProperty(oldConfig.popup, 'scheduleOptions', defaultConfig.popup.scheduleOptions);
    Migration._addProperty(oldConfig.popup, 'scheduleEnabled', defaultConfig.popup.scheduleEnabled);
    Migration._migrateStringToBoolean(oldConfig.gmail, 'embedButton');
    Migration._migrateStringToBoolean(oldConfig.jira, 'priorityMappingEnabled');

    Migration._updateConfigVersion(oldConfig);
    return oldConfig;
  }
}

const defaultConfig = {
  version: Migration._getLatestConfigVersion(),
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
    console.log(JSON.stringify(response));
    const oldConfig = response.configuration;
    let configuration;
    if (!oldConfig) {
      top.LOGGER.info('Configuration not found, setting up defaults for version', defaultConfig.version);
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

// Tests //TODO do this in a more systematic way
top.TEST = top.TEST || {};
top.TEST.MIGRATION = top.TEST.MIGRATION || {};
top.TEST.MIGRATION.Migration = Migration;
top.TEST.MIGRATION.defaultConfig = defaultConfig;