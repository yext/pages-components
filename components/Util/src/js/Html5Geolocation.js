export class HTML5Geolocation {
  static initClass(options = {}) {

    this.inflight = false;
    this.successes = [];
    this.failures = [];
    this.options = options
  }

  static enabled() {
    return ("geolocation" in navigator);
  }

  static getCurrentLocation(success, failure) {
    if (this.cached) { return success(this.cached); }
    if (success != null) { this.successes.push(success); }
    if (failure != null) { this.failures.push(failure); }
    if (this.inflight) { return; }
    this.inflight = true;
    return this.geolocate((latitude, longitude)  => {
      this.successes.forEach(element => element(latitude, longitude));
      this.successes = [];
      this.failures = [];
      return this.inflight = false;
    }
    , error => {
      this.failures.forEach(element => element(error));
      this.successes = [];
      this.failures = [];
      return this.inflight = false;
    });
  }
  static geolocate(success, failure) {
    if (!this.enabled()) {
      if (failure != null) { failure(new Error('geolocation is not enabled')); }
      return;
    }

    return navigator.geolocation.getCurrentPosition(position => {
      this.cached = {latitude: position.coords.latitude, longitude: position.coords.longitude};
      if (success != null) { return success({latitude: position.coords.latitude, longitude: position.coords.longitude}); }
    }
    , function(error) {
      if (failure != null) { return failure(error); }
    }, this.options);
  }
}
