// requires LOGGER, CONFIG_STORE

class TodoistClient {
  static _getApiKey() {
    return top.CONFIG_STORE.loadConfigSection('todoist')
      .then((todoistConfig) => todoistConfig.todoistApiKey);
  }

  static _appendAuthHeader(apiKey, request) {
    request.setRequestHeader('Authorization', 'Bearer ' + (apiKey || '-'));
  }

  _responseAdapter(path, request, resolve, reject) {
    request.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        const statusCode = request.status;
        if (statusCode >= 200 && statusCode < 300) {
          top.LOGGER.debug('Request to', path, 'finished successfully with status code', statusCode);
          resolve(request.response);
        } else {
          reject({
            message: 'Call to Todoist API failed',
            status: request.status,
            response: request.response
          });
        }
      }
    };
  }

  _sendPost(apiKey, path, body) {
    return new Promise((resolve, reject) => {
      top.LOGGER.debug('Sending POST request to Todoist API', path, 'with body', body);

      const request = new XMLHttpRequest();
      request.open('POST', path, true);
      request.setRequestHeader('Content-Type', 'application/json');
      TodoistClient._appendAuthHeader(apiKey, request);
      this._responseAdapter(path, request, resolve, reject);
      request.send(JSON.stringify(body));
    });
  }

  _sendGet(apiKey, path) {
    return new Promise((resolve, reject) => {
      top.LOGGER.debug('Sending GET request to Todoist API', path);

      const request = new XMLHttpRequest();
      request.open('GET', path, true);
      TodoistClient._appendAuthHeader(apiKey, request);
      this._responseAdapter(path, request, resolve, reject);
      request.send();
    });
  }

  createTask(task) {
    return TodoistClient._getApiKey()
      .then((apiKey) => this._sendPost(apiKey, 'https://api.todoist.com/rest/v1/tasks', task));
  }

  getProjects() {
    return TodoistClient._getApiKey()
      .then((apiKey) => this._sendGet(apiKey, 'https://api.todoist.com/rest/v1/projects'));
  }

  static hasApiKey() {
    return TodoistClient._getApiKey()
      .then((apiKey) => apiKey && apiKey !== '');
  }
}

// export
top.TODOIST_CLIENT = top.TODOIST_CLIENT || new TodoistClient();