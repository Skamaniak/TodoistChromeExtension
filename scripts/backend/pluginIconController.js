//requires LOGGER

class PluginIconController {
  _setIcon (iconPath) {
    chrome.browserAction.setIcon({
      path: {
        '32': iconPath
      }
    });
  };

  _animateIcon (animPath, frames, cycleLength) {
    const delay = cycleLength / frames;
    let frame = 0;
    const setNextFrame = () => {
      this._setIcon(animPath.replace('%frame', frame));
      frame = (frame + 1) % (frames - 1);
    };
    this.animationInterval = setInterval(setNextFrame, delay);
  };

  _setSuccessIcon () {
    this._setIcon('images/success-icon-32.png');
  }

  _setFailureIcon () {
    this._setIcon('images/error-icon-32.png');
  }

  _setInfoIcon () {
    this._setIcon('images/info-icon-32.png');
  }

  _setDefaultIcon () {
    this._setIcon('images/todoist-icon-32.png');
  }

  _setLoadingIndicatorIcon () {
    this._animateIcon('images/animation/spinner/spinner-32-f%frame.gif', 12, 1000);
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
}

// export
top.PLUGIN_ICON = top.PLUGIN_ICON || new PluginIconController();