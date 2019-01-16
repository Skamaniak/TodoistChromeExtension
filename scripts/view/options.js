let currentTimeout;
const showConfigSaved = () => {
  const responseTextElem = document.getElementById('responseText');
  responseTextElem.textContent = 'Configuration successfully saved';
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
    GMAIL: {
      taskTemplate: document.getElementById('gmailTaskTemplate'),
      embedButton: document.getElementById('gmailEmbedButtonSelect')
    },
    CONFLUENCE: {
      taskTemplate: document.getElementById('confluenceTaskTemplate')
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
      blockerPriority: document.getElementById('jiraBlockerPriorityMapping')
    },
    WEBSITE: {
      taskTemplate: document.getElementById('websiteTaskTemplate')
    }
  };

  const refreshMappingEnabledState = () => {
    const sectionElement = ELEMS.JIRA.priorityMappingExtend;
    ELEMS.JIRA.reflectPriority.value === 'true' ? sectionElement.classList.remove('hidden') :
      sectionElement.classList.add('hidden');
  };

  const todoistPriorityFromString = (strValue) => {
    const priority = parseInt(strValue);
    return (priority && priority > 0 && priority < 5) ? priority : top.DEFAULTS.DEFAULT_TODOIST_PRIORITY;
  };

  top.CONFIG_STORE.loadConfig()
    .then((config) => {
      const priorityMapping = config.jira.priorityMapping;
      ELEMS.TODOIST.apiKey.value = config.todoist.todoistApiKey;
      ELEMS.GMAIL.taskTemplate.value = config.gmail.taskTemplate;
      ELEMS.CONFLUENCE.taskTemplate.value = config.confluence.taskTemplate;
      ELEMS.JIRA.taskTemplate.value = config.jira.taskTemplate;
      ELEMS.JIRA.priorityMappingEnabled.value = config.jira.priorityMappingEnabled;
      ELEMS.JIRA.trivialPriority.value = priorityMapping['Trivial'];
      ELEMS.JIRA.minorPriority.value = priorityMapping['Minor'];
      ELEMS.JIRA.majorPriority.value = priorityMapping['Major'];
      ELEMS.JIRA.criticalPriority.value = priorityMapping['Critical'];
      ELEMS.JIRA.blockerPriority.value = priorityMapping['Blocker'];
      ELEMS.WEBSITE.taskTemplate.value = config.website.taskTemplate;

      refreshMappingEnabledState();
    });

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
      gmail: {
        taskTemplate: ELEMS.GMAIL.taskTemplate.value,
        embedButton: ELEMS.GMAIL.embedButton.value
      },
      confluence: {
        taskTemplate: ELEMS.CONFLUENCE.taskTemplate.value
      },
      jira: {
        taskTemplate: ELEMS.JIRA.taskTemplate.value,
        priorityMappingEnabled: ELEMS.JIRA.priorityMappingEnabled.value,
        priorityMapping: jiraPriorities
      },
      website: {
        taskTemplate: ELEMS.WEBSITE.taskTemplate.value
      }
    };
    top.CONFIG_STORE.storeConfig(config)
      .then(() => showConfigSaved());
  };

  ELEMS.JIRA.reflectPriority.onchange = refreshMappingEnabledState;
};
