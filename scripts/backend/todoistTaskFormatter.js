// requires LOGGER, CONFIG_STORE

class TodoistTaskFormatter {
  _formatEmailTask (taskDefinition) {
    return top.CONFIG_STORE.loadConfigSection('gmail')
      .then((config) => {
        top.LOGGER.debug('Formatting task from gmail', taskDefinition);
        const content = config.taskTemplate
          .replace('$subject', taskDefinition.subject)
          .replace('$source', taskDefinition.source)
          .replace('$senderName', taskDefinition.senderName)
          .replace('$senderEmailAddress', taskDefinition.senderEmailAddress)
          .replace('$href', taskDefinition.href)
          .replace('$message', taskDefinition.message || '');

        const task = { content };
        if (taskDefinition.projectId) {
          task['project_id'] = taskDefinition.projectId;
        }
        return task;
      });
  };

  _formatConfluenceTask (taskDefinition) {
    return top.CONFIG_STORE.loadConfigSection('confluence')
      .then((config) => {
        top.LOGGER.debug('Formatting task from confluence', taskDefinition);
        const content = config.taskTemplate
          .replace('$title', taskDefinition.title)
          .replace('$source', taskDefinition.source)
          .replace('$href', taskDefinition.href)
          .replace('$message', taskDefinition.message || '');

        const task = { content };
        if (taskDefinition.projectId) {
          task['project_id'] = taskDefinition.projectId;
        }
        return task;
      });
  };

  _formatJiraTask (taskDefinition) {
    return top.CONFIG_STORE.loadConfigSection('jira')
      .then((config) => {
        top.LOGGER.debug('Formatting task from jira', taskDefinition);
        const content = config.taskTemplate
          .replace('$summary', taskDefinition.summary)
          .replace('$source', taskDefinition.source)
          .replace('$href', taskDefinition.href)
          .replace('$issueType', taskDefinition.issueType)
          .replace('$reporter', taskDefinition.reporter)
          .replace('$assignee', taskDefinition.assignee)
          .replace('$priority', taskDefinition.priority)
          .replace('$status', taskDefinition.status)
          .replace('$message', taskDefinition.message || '');

        const task = { content };
        if (config.priorityMappingEnabled === 'true') {
          const priority = config.priorityMapping[taskDefinition.priority];
          top.LOGGER.debug('Adding priority mapping', taskDefinition.priority, 'to', priority);
          task['priority'] = priority;
        }
        if (taskDefinition.projectId) {
          task['project_id'] = taskDefinition.projectId;
        }
        return task;
      });
  };

  _formatWebsiteTask (taskDefinition) {
    return top.CONFIG_STORE.loadConfigSection('website')
      .then((config) => {
        top.LOGGER.debug('Formatting task from generic website', taskDefinition);
        const content = config.taskTemplate
          .replace('$title', taskDefinition.title)
          .replace('$source', taskDefinition.source)
          .replace('$href', taskDefinition.href)
          .replace('$message', taskDefinition.message || '');

        const task = { content };
        if (taskDefinition.projectId) {
          task['project_id'] = taskDefinition.projectId;
        }
        return task;
      });
  };

  formatters (source) {
    const mapping = {
      'Email': (taskDefinition) => this._formatEmailTask(taskDefinition),
      'Confluence': (taskDefinition) => this._formatConfluenceTask(taskDefinition),
      'Jira': (taskDefinition) => this._formatJiraTask(taskDefinition),
      'Website': (taskDefinition) => this._formatWebsiteTask(taskDefinition)
    };
    return mapping[source];
  };

  toTodoistTask (taskDefinition) {
    const formatter = this.formatters(taskDefinition.source);
    return formatter(taskDefinition);
  }
}

// export
top.TASK_FORMATTER = top.TASK_FORMATTER || {};
top.TASK_FORMATTER = new TodoistTaskFormatter();