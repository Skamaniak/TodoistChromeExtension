class TodoistClient {
    static _getApiKey() {
        return top.CONFIG_STORE.loadConfigSection('todoist')
            .then((todoistConfig) => todoistConfig.todoistApiKey);
    }

    _sendPost(apiKey, path, body) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open("POST", path, true);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Authorization", "Bearer " + (apiKey || "-"));
            request.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(request.response)
                    } else {
                        reject({
                            message: "Call to Todoist API failed",
                            status: request.status,
                            response: request.response
                        });
                    }
                }
            };
            request.send(JSON.stringify(body));
        });
    }

    createTask(task) {
        return TodoistClient._getApiKey()
            .then((apiKey) => this._sendPost(apiKey, "https://beta.todoist.com/API/v8/tasks", task))
    }
}

// export
top.TODOIST_CLIENT = top.TODOIST_CLIENT || new TodoistClient();