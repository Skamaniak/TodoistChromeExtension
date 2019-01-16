const DEFAULT_TODOIST_PRIORITY = 1;
const JIRA_PRIORITY_MAPPING = {
  'Trivial': DEFAULT_TODOIST_PRIORITY,
  'Minor': DEFAULT_TODOIST_PRIORITY,
  'Major': DEFAULT_TODOIST_PRIORITY,
  'Critical': DEFAULT_TODOIST_PRIORITY,
  'Blocker': DEFAULT_TODOIST_PRIORITY
};

const defaultConfig = {
  todoist: {
    todoistApiKey: ''
  },
  gmail: {
    taskTemplate: '[$subject ($source)]($href)',
    embedButton: 'true'
  },
  confluence: {
    taskTemplate: '[$title ($source)]($href)'
  },
  jira: {
    taskTemplate: '[$summary ($source)]($href)',
    priorityMappingEnabled: 'false',
    priorityMapping: JIRA_PRIORITY_MAPPING
  },
  website: {
    taskTemplate: '[$title ($source)]($href)'
  }
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ configuration: defaultConfig });
});

// export
top.DEFAULTS = top.DEFAULTS || {};
top.DEFAULTS.DEFAULT_TODOIST_PRIORITY = DEFAULT_TODOIST_PRIORITY;