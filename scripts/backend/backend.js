class PluginIconController {
    _setIcon(iconPath) {
        chrome.browserAction.setIcon({
            path: {
                "32": iconPath
            }
        });
    };

    _animateIcon(animPath, frames, cycleLength) {
        const delay = cycleLength / frames;
        let frame = 0;
        const setNextFrame = () => {
            this._setIcon(animPath.replace("%frame", frame));
            frame = (frame + 1) % (frames - 1)
        };
        this.animationInterval = setInterval(setNextFrame, delay)
    };

    _setSuccessIcon() {
        this._setIcon("images/success-icon-32.png");
    }

    _setFailureIcon() {
        this._setIcon("images/error-icon-32.png");
    }

    _setDefaultIcon() {
        this._setIcon("images/todoist-icon-32.png");
    }

    _setLoadingIndicatorIcon() {
        this._animateIcon("images/animation/spinner/spinner-32-f%frame.gif", 12, 1000)
    };

    _cancelPendingActions() {
        const timer = this.iconSwitchTimer;
        if (timer) {
            clearTimeout(timer);
        }
        const animationInterval = this.animationInterval;
        if (animationInterval) {
            clearInterval(animationInterval)
        }
    }

    signalSuccess() {
        this._cancelPendingActions();
        this._setSuccessIcon();
        this.iconSwitchTimer = setTimeout(() => this._setDefaultIcon(), 2000)
    }

    signalFailure() {
        this._cancelPendingActions();
        this._setFailureIcon();
        this.iconSwitchTimer = setTimeout(() => this._setDefaultIcon(), 2000)
    }

    signalLoading() {
        this._cancelPendingActions();
        this._setLoadingIndicatorIcon();
    }
}
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

    createTask(taskText) {
        const task = {
            "content": taskText
        };
        return TodoistClient._getApiKey()
            .then((apiKey) => this._sendPost(apiKey, "https://beta.todoist.com/API/v8/tasks", task))
    }
}
class AlertManager {
    static _getHint(error) {
        const status = error.status;
        if (status === 401 || status === 403) {
            return "Please check your API Key. Right click to plugin icon > Options.";
        }
        if (status >= 400 && status < 500) {
            return "There is something wrong with Chrome Plugin. Please try to download new version or contact Author."
        }
        if (status >= 500) {
            return "Todoist service seems to be temporarily unavailable";
        }
    }

    static showError(error) {
        if (error instanceof Error) {
            alert(error);
        } else {
            const hint = AlertManager._getHint(error);
            let errorMessage = error.message + "\n" + error.status + " " + error.response + "";
            if (hint) {
                errorMessage += "\n" + hint
            }
            alert(errorMessage);
        }
    }
}

const pluginIconController = new PluginIconController();
const todoistClient = new TodoistClient();

const createTask = (taskDefinition) => {
    pluginIconController.signalLoading();
    top.TASK_FORMATTER.toTodoistTask(taskDefinition)
        .then((taskText) => todoistClient.createTask(taskText))
        .then(() => pluginIconController.signalSuccess())
        .catch((error) => {
            pluginIconController.signalFailure();
            AlertManager.showError(error);
        });
};

const actionHandlers = {
    "CREATE_TASK": createTask,
    "ACTION_CURRENTLY_UNAVAILABLE": () => pluginIconController.signalFailure()
};

chrome.runtime.onMessage.addListener(function (request) {
    const handler = actionHandlers[request.action];
    handler(request.payload);
});

chrome.browserAction.onClicked.addListener(function() {
    top.MESSAGE_BUS.TO_FRONTEND.createTask();
});