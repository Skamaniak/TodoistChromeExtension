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

// export
top.PLUGIN_ICON = top.PLUGIN_ICON || new PluginIconController();