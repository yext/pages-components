import 'script-loader!node_modules/autotrack/autotrack.js';

export class GoogleAnalytics {
  static enableAutotracking(trackerName) {

    const requireForTracker = `${trackerName}.require`

    // Wait for GA to load so we can see if the tracker actually exists
    ga(function() {
      const tracker = ga.getByName(requireForTracker);
      if (tracker) {
        ga(requireForTracker, 'eventTracker');
        ga(requireForTracker, 'impressionTracker');
        ga(requireForTracker, 'maxScrollTracker');
        ga(requireForTracker, 'outboundFormTracker');
        ga(requireForTracker, 'outboundLinkTracker');
        ga(requireForTracker, 'pageVisibilityTracker');
        ga(requireForTracker, 'urlChangeTracker');
      }
    });
  }
}