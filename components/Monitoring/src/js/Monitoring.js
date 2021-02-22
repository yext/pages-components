import Raven from 'raven-js/dist/raven.js';

function config(sentryEndpoint, additionalOptions = {}) {
  let data, datafound, error;
  let alarm = function(msg) {
    console.warn(msg);
    return Raven.captureMessage(msg);
  };

  let environment = 'production';
  let extra = {};

  let dataContainer = document.querySelector('#monitoring-data');
  let dataFound = false;
  if (dataContainer != null) {
    try {
      data = JSON.parse(dataContainer.innerHTML);
      if (data.isStaging) { environment = 'nonprod'; }
      extra = data;
      datafound = true;
    } catch (error1) { error = error1; }
  }

  if (!datafound) { alarm(`Unable to find monitoring data (${window.location.host})`); }

  let opts = {
    environment,
    extra
  };

  Raven.config(sentryEndpoint, { ...opts, ...additionalOptions });
}

function reportAjaxErrors() {
  if (typeof jQuery !== 'undefined' && jQuery !== null) {
    // Automatic AJAX error notification, see https://docs.sentry.io/clients/javascript/tips/ for more info
    jQuery(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
      if (Raven.isSetup()) {
        Raven.captureMessage(thrownError || jqXHR.statusText, {
          extra: {
            type: ajaxSettings.type,
            url: ajaxSettings.url,
            data: ajaxSettings.data,
            status: jqXHR.status,
            error: thrownError || jqXHR.statusText,
            response: (jqXHR.responseText != null ? jqXHR.responseText.substring(0, 100) : undefined)
          }
        });
      }
    });
  }
}

function Enable() {
  Raven.install();
}

function Disable() {
  Raven.uninstall();
}

function MonitoringInit(sentryEndpoint, additionalOptions = {}) {
  config(sentryEndpoint, additionalOptions);
  reportAjaxErrors();

  if (Raven._globalOptions.environment == 'nonprod') {
    console.log("Sentry is disabled by default in a staging environment. To enable, please run 'Monitoring.Enable()'");
  } else {
    Enable();
  }
}

export {
  Enable,
  Disable,
  MonitoringInit
};
