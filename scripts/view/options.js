let currentTimeout;
const showConfigSaved = () => {
  const responseTextElem = document.getElementById('responseText');
  responseTextElem.textContent = 'Configuration saved';
  if (currentTimeout) {
    clearTimeout(currentTimeout);
  }
  currentTimeout = setTimeout(() => responseTextElem.textContent = '', 2000);
};

window.onload = () => {
  const ELEMS = {
    ACTIONS: {
      save: document.getElementById('saveButton')
    },
    TODOIST: {
      apiKey: document.getElementById('todoistApiKey')
    },
    POPUP: {
      timeout: document.getElementById('popupTimeout'),
      scheduleEnabled: document.getElementById('scheduleShow'),
      scheduleExtend: document.getElementById('scheduleDetails'),
      scheduleOptions: document.getElementById('scheduleOptions')
    },
    GMAIL: {
      taskTemplate: document.getElementById('gmailTaskTemplate'),
      embedButton: document.getElementById('gmailEmbedButtonSelect'),
      regexIdentifier: document.getElementById('gmailRegexIdentifier')
    },
    CONFLUENCE: {
      taskTemplate: document.getElementById('confluenceTaskTemplate'),
      regexIdentifier: document.getElementById('confluenceRegexIdentifier')
    },
    JIRA: {
      taskTemplate: document.getElementById('jiraTaskTemplate'),
      priorityMappingExtend: document.getElementById('jiraPriorityMapping'),
      priorityMappingEnabled: document.getElementById('jiraReflectPriority'),
      trivialPriority: document.getElementById('jiraTrivialPriorityMapping'),
      minorPriority: document.getElementById('jiraMinorPriorityMapping'),
      majorPriority: document.getElementById('jiraMajorPriorityMapping'),
      criticalPriority: document.getElementById('jiraCriticalPriorityMapping'),
      blockerPriority: document.getElementById('jiraBlockerPriorityMapping'),
      regexIdentifier: document.getElementById('jiraRegexIdentifier')
    },
    WEBSITE: {
      taskTemplate: document.getElementById('websiteTaskTemplate'),
      regexIdentifier: document.getElementById('websiteRegexIdentifier')

    },
    ADVANCED: {
      showAdvancedOptions: document.getElementById('showAdvancedOptions')
    },
    OTHER: {
      configVersion: document.getElementById('configVersion')
    }
  };

  const refreshMappingEnabledState = () => {
    const sectionElement = ELEMS.JIRA.priorityMappingExtend;
    ELEMS.JIRA.priorityMappingEnabled.value === 'true' ? sectionElement.classList.remove('hidden') :
      sectionElement.classList.add('hidden');
  };

  const refreshScheduleEnabledState = () => {
    const sectionElement = ELEMS.POPUP.scheduleExtend;
    ELEMS.POPUP.scheduleEnabled.value === 'true' ? sectionElement.classList.remove('hidden') :
      sectionElement.classList.add('hidden');
  };

  const showAdvancedOptions = (e) => {
    document.querySelectorAll('.locked')
      .forEach((elem) => elem.classList.remove('locked'));
    ELEMS.ADVANCED.showAdvancedOptions.classList.add('hidden');
    e.preventDefault();
  };

  const todoistPriorityFromString = (strValue) => {
    const priority = parseInt(strValue);
    return (priority && priority > 0 && priority < 5) ? priority : top.DEFAULTS.DEFAULT_TODOIST_PRIORITY;
  };

  const stringToArray = (str) => {
    if (!str) {
      return [];
    }
    return str.split(',')
      .map(opt => opt.trim())
      .filter(opt => opt !== '');
  };

  const arrayToString = (arr) => arr.join(', ');

  const stringToBoolean = (str) => str === 'true';

  // Initial config load and data population
  top.CONFIG_STORE.loadConfig()
    .then((config) => {
      const priorityMapping = config.jira.priorityMapping;
      ELEMS.TODOIST.apiKey.value = config.todoist.todoistApiKey;

      ELEMS.POPUP.timeout.value = config.popup.timeoutMs;
      ELEMS.POPUP.scheduleOptions.value = arrayToString(config.popup.scheduleOptions);
      ELEMS.POPUP.scheduleEnabled.value = config.popup.scheduleEnabled;
      ELEMS.GMAIL.taskTemplate.value = config.gmail.taskTemplate;
      ELEMS.GMAIL.regexIdentifier.value = config.gmail.regexIdentifier;

      ELEMS.CONFLUENCE.taskTemplate.value = config.confluence.taskTemplate;
      ELEMS.CONFLUENCE.regexIdentifier.value = config.confluence.regexIdentifier;

      ELEMS.JIRA.taskTemplate.value = config.jira.taskTemplate;
      ELEMS.JIRA.priorityMappingEnabled.value = config.jira.priorityMappingEnabled;
      ELEMS.JIRA.trivialPriority.value = priorityMapping['Trivial'];
      ELEMS.JIRA.minorPriority.value = priorityMapping['Minor'];
      ELEMS.JIRA.majorPriority.value = priorityMapping['Major'];
      ELEMS.JIRA.criticalPriority.value = priorityMapping['Critical'];
      ELEMS.JIRA.blockerPriority.value = priorityMapping['Blocker'];
      ELEMS.JIRA.regexIdentifier.value = config.jira.regexIdentifier;

      ELEMS.WEBSITE.taskTemplate.value = config.website.taskTemplate;
      ELEMS.WEBSITE.regexIdentifier.value = config.website.regexIdentifier;

      ELEMS.OTHER.configVersion.innerText = 'Version: ' + config.version;
      ELEMS.OTHER.configVersion.setAttribute('data-version', config.version);

      // Show or hide config sections based on current configuration
      refreshMappingEnabledState();
      refreshScheduleEnabledState();
    });

  // Listeners
  ELEMS.ACTIONS.save.onclick = () => {
    const jiraPriorities = {
      'Trivial': todoistPriorityFromString(ELEMS.JIRA.trivialPriority.value),
      'Minor': todoistPriorityFromString(ELEMS.JIRA.minorPriority.value),
      'Major': todoistPriorityFromString(ELEMS.JIRA.majorPriority.value),
      'Critical': todoistPriorityFromString(ELEMS.JIRA.criticalPriority.value),
      'Blocker': todoistPriorityFromString(ELEMS.JIRA.blockerPriority.value)
    };

    const config = {
      todoist: {
        todoistApiKey: ELEMS.TODOIST.apiKey.value
      },
      popup: {
        timeoutMs: ELEMS.POPUP.timeout.value,
        scheduleOptions: stringToArray(ELEMS.POPUP.scheduleOptions.value),
        scheduleEnabled: stringToBoolean(ELEMS.POPUP.scheduleEnabled.value)
      },
      gmail: {
        taskTemplate: ELEMS.GMAIL.taskTemplate.value,
        embedButton: stringToBoolean(ELEMS.GMAIL.embedButton.value),
        regexIdentifier: ELEMS.GMAIL.regexIdentifier.value
      },
      confluence: {
        taskTemplate: ELEMS.CONFLUENCE.taskTemplate.value,
        regexIdentifier: ELEMS.CONFLUENCE.regexIdentifier.value
      },
      jira: {
        taskTemplate: ELEMS.JIRA.taskTemplate.value,
        priorityMappingEnabled: stringToBoolean(ELEMS.JIRA.priorityMappingEnabled.value),
        priorityMapping: jiraPriorities,
        regexIdentifier: ELEMS.JIRA.regexIdentifier.value
      },
      website: {
        taskTemplate: ELEMS.WEBSITE.taskTemplate.value,
        regexIdentifier: ELEMS.WEBSITE.regexIdentifier.value
      },
      version: ELEMS.OTHER.configVersion.getAttribute('data-version')
    };
    top.CONFIG_STORE.storeConfig(config)
      .then(() => showConfigSaved());
  };

  ELEMS.POPUP.scheduleEnabled.onchange = refreshScheduleEnabledState;
  ELEMS.JIRA.priorityMappingEnabled.onchange = refreshMappingEnabledState;
  ELEMS.ADVANCED.showAdvancedOptions.onclick = showAdvancedOptions;
};
