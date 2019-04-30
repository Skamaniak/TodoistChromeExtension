//requires LOGGER, CONFIG_STORE

class PluginIcon {
  constructor (queueLimit = 1) {
    this.operationsQueue = Promise.resolve();
    this.queueSize = 0;
    this.queueLimit = queueLimit;
  }

  _createSetIconTask (iconPath) {
    return () => new Promise(resolve => {
      chrome.browserAction.setIcon({
        path: {
          '32': iconPath
        }
      }, resolve);
    });
  };

  setIcon (iconPath, force = false) {
    if (force || this.queueSize < this.queueLimit) {
      this.queueSize += 1;
      this.operationsQueue = this.operationsQueue.then(this._createSetIconTask(iconPath))
        .then(() => this.queueSize -= 1);
    } else {
      top.LOGGER.debug("Skipping icon", iconPath)
    }
  };
}

class PluginIconController {
  constructor () {
    this.pluginIcon = new PluginIcon();
  }

  _animateIcon (animPath, frames, cycleLength, loop = true) {
    const delay = cycleLength / frames;
    let frame = 0;
    const setNextFrame = () => {
      this.pluginIcon.setIcon(animPath.replace('%frame', frame));
      frame = (frame + 1) % frames;

      if (!loop && frame === 0) {
        this._cancelPendingActions();
      }
    };
    this.animationInterval = setInterval(setNextFrame, delay);
  };

  _setSuccessIcon () {
    this.pluginIcon.setIcon('images/success-icon-32.png', true);
  }

  _setFailureIcon () {
    this.pluginIcon.setIcon('images/error-icon-32.png', true);
  }

  _setInfoIcon () {
    this.pluginIcon.setIcon('images/info-icon-32.png', true);
  }

  _setDefaultIcon () {
    this.pluginIcon.setIcon('images/plugin-icon-32.png', true);
  }

  _setLoadingIndicatorIcon () {
    this._animateIcon('images/animation/spinner/spinner-32-f%frame.png', 8, 500);
  };

  _setWaitingIndicatorIcon () {
    top.CONFIG_STORE.loadConfigSection('popup').then((popup) => {
      this._animateIcon('images/animation/loader/progress-32-f%frame.png', 51, popup.timeoutMs, false);
    });
  };

  _cancelPendingActions () {
    top.LOGGER.debug('Cancelling current plugin icon timers');
    const timer = this.iconSwitchTimer;
    if (timer) {
      clearTimeout(timer);
    }
    const animationInterval = this.animationInterval;
    if (animationInterval) {
      clearInterval(animationInterval);
    }
  }

  signalSuccess () {
    top.LOGGER.debug('Setting plugin icon to success state');
    this._cancelPendingActions();
    this._setSuccessIcon();
    this.iconSwitchTimer = setTimeout(() => this._setDefaultIcon(), 2000);
  }

  signalFailure () {
    top.LOGGER.debug('Setting plugin icon to failure state');
    this._cancelPendingActions();
    this._setFailureIcon();
    this.iconSwitchTimer = setTimeout(() => this._setDefaultIcon(), 2000);
  }

  signalInfo () {
    top.LOGGER.debug('Setting plugin icon to info state');
    this._cancelPendingActions();
    this._setInfoIcon();
    this.iconSwitchTimer = setTimeout(() => this._setDefaultIcon(), 2000);
  }

  signalLoading () {
    top.LOGGER.debug('Setting plugin icon to loading indicator');
    this._cancelPendingActions();
    this._setLoadingIndicatorIcon();
  }

  signalWaiting () {
    top.LOGGER.debug('Setting plugin icon to waiting indicator');
    this._cancelPendingActions();
    this._setWaitingIndicatorIcon();
  }

  clearSignal () {
    top.LOGGER.debug('Resetting plugin icon');
    this._cancelPendingActions();
    this._setDefaultIcon();
  }
}

// export
top.PLUGIN_ICON = top.PLUGIN_ICON || new PluginIconController();