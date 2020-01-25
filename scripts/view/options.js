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
      timeout: document.getElementById('popupTimeout')
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
      reflectPriority: document.getElementById('jiraReflectPriority'),
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
    ELEMS.JIRA.reflectPriority.value === 'true' ? sectionElement.classList.remove('hidden') :
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

  // Initial config load and data population
  top.CONFIG_STORE.loadConfig()
    .then((config) => {
      const priorityMapping = config.jira.priorityMapping;
      ELEMS.TODOIST.apiKey.value = config.todoist.todoistApiKey;

      ELEMS.POPUP.timeout.value = config.popup.timeoutMs;

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

      refreshMappingEnabledState();
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
        scheduleOptions: ['Today', 'Tomorrow', 'Next week'] //TODO make it configurable
      },
      gmail: {
        taskTemplate: ELEMS.GMAIL.taskTemplate.value,
        embedButton: ELEMS.GMAIL.embedButton.value,
        regexIdentifier: ELEMS.GMAIL.regexIdentifier.value
      },
      confluence: {
        taskTemplate: ELEMS.CONFLUENCE.taskTemplate.value,
        regexIdentifier: ELEMS.CONFLUENCE.regexIdentifier.value
      },
      jira: {
        taskTemplate: ELEMS.JIRA.taskTemplate.value,
        priorityMappingEnabled: ELEMS.JIRA.priorityMappingEnabled.value,
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

  ELEMS.JIRA.reflectPriority.onchange = refreshMappingEnabledState;
  ELEMS.ADVANCED.showAdvancedOptions.onclick = showAdvancedOptions;
};
