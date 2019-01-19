// requires LOGGER

class NotificationManager {
  _getHint (error) {
    const status = error.status;
    if (status === 401 || status === 403) {
      return 'Please check your API Key';
    }
    if (status >= 400 && status < 500) {
      return 'Please update plugin or contact Author';
    }
    if (status >= 500) {
      return 'Todoist service is temporarily unavailable';
    }
  }

  _areNotificatonsEnabled () {
    return new Promise(resolve => {
      chrome.notifications.getPermissionLevel((level) => {
        resolve(level === 'granted');
      });
    });
  }

  _notify (notification) {
    top.LOGGER.debug('Publishing notification', notification);
    chrome.notifications.create(null, notification);
  }

  _publishImportantNotificaton (notification) {
    this._areNotificatonsEnabled()
      .then((enabled) => {
        if (enabled) {
          this._notify(notification);
        } else {
          top.LOGGER.info('Publishing important notification', notification, 'via alert because notifications are disabled');
          alert(notification.title + '\n' + notification.message);
        }
      });
  }

  _publishNotImportantNotificaton (notification) {
    this._areNotificatonsEnabled()
      .then((enabled) => {
        if (enabled) {
          this._notify(notification);
        } else {
          top.LOGGER.info('Skipping publishing of notification', notification, 'because notifications are disabled');
        }
      });
  }

  _formatError (error) {
    const formattedError = {
      iconUrl: 'images/error-icon-128.png',
      type: 'basic'
    };
    if (error instanceof Error) {
      formattedError.message = error.toString();
      formattedError.title = 'Something went wrong';
    } else {
      const hint = this._getHint(error);
      top.LOGGER.debug('Resolved hint', hint, 'for error', error);
      formattedError.title = error.message;
      let errorMessage = error.status + ' ' + error.response;
      if (hint) {
        errorMessage += hint;
      }
      formattedError.message = errorMessage;
      formattedError.expandedMessage = errorMessage;
    }
    return formattedError;
  }

  alert (error) {
    const formattedError = this._formatError(error);
    this._publishImportantNotificaton(formattedError);
  }

  announce (notification) {
    if (!notification.type) {
      notification.type = 'basic';
    }
    this._publishNotImportantNotificaton(notification);
  }
}

// export
top.NOTIFICATION_MANAGER = top.NOTIFICATION_MANAGER || new NotificationManager();