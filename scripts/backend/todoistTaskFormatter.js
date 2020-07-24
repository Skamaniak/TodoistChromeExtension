// requires LOGGER, CONFIG_STORE

class TodoistTaskFormatter {
  static createTask(taskDefinition, content) {
    const task = {content};
    if (taskDefinition.projectId) {
      task['project_id'] = taskDefinition.projectId;
    }
    if (taskDefinition.schedule && taskDefinition.schedule !== 'None') {
      task['due_string'] = taskDefinition.schedule;
    }
    return task;
  }

  _formatEmailTask(taskDefinition) {
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

        return TodoistTaskFormatter.createTask(taskDefinition, content);
      });
  }

  _formatConfluenceTask(taskDefinition) {
    return top.CONFIG_STORE.loadConfigSection('confluence')
      .then((config) => {
        top.LOGGER.debug('Formatting task from confluence', taskDefinition);
        const content = config.taskTemplate
          .replace('$title', taskDefinition.title)
          .replace('$source', taskDefinition.source)
          .replace('$href', taskDefinition.href)
          .replace('$message', taskDefinition.message || '');

        return TodoistTaskFormatter.createTask(taskDefinition, content);
      });
  }

  _formatJiraTask(taskDefinition) {
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
          .replace('$key', taskDefinition.key)
          .replace('$message', taskDefinition.message || '');

        const task = TodoistTaskFormatter.createTask(taskDefinition, content);
        if (config.priorityMappingEnabled) {
          const priority = config.priorityMapping[taskDefinition.priority];
          top.LOGGER.debug('Adding priority mapping', taskDefinition.priority, 'to', priority);
          task['priority'] = priority;
        }
        return task;
      });
  }

  _formatWebsiteTask(taskDefinition) {
    return top.CONFIG_STORE.loadConfigSection('website')
      .then((config) => {
        top.LOGGER.debug('Formatting task from generic website', taskDefinition);
        const content = config.taskTemplate
          .replace('$title', taskDefinition.title)
          .replace('$source', taskDefinition.source)
          .replace('$href', taskDefinition.href)
          .replace('$message', taskDefinition.message || '');

        return TodoistTaskFormatter.createTask(taskDefinition, content);
      });
  }

  formatters(source) {
    const mapping = {
      'Email': (taskDefinition) => this._formatEmailTask(taskDefinition),
      'Confluence': (taskDefinition) => this._formatConfluenceTask(taskDefinition),
      'Jira': (taskDefinition) => this._formatJiraTask(taskDefinition),
      'Website': (taskDefinition) => this._formatWebsiteTask(taskDefinition)
    };
    return mapping[source];
  }

  toTodoistTask(taskDefinition) {
    const formatter = this.formatters(taskDefinition.source);
    return formatter(taskDefinition);
  }
}

// export
top.TASK_FORMATTER = top.TASK_FORMATTER || {};
top.TASK_FORMATTER = new TodoistTaskFormatter();