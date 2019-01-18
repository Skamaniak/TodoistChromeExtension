class AlertManager {
    static _getHint(error) {
        const status = error.status;
        if (status === 401 || status === 403) {
            return "Please check your API Key. Right click to plugin icon and select Options.";
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

// export
top.ALERT_MANAGER = top.ALERT_MANAGER || AlertManager;