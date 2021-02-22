class HTML5GeolocationOptions {
  constructor(highAccurancy, timeout, maximumAge) {
    this.enableHighAccuracy = highAccurancy
    this.timeout = timeout;
    this.maximumAge = maximumAge;
  }

  asOptionsObject() {
    return {
      enableHighAccuracy: this.enableHighAccuracy,
      timeout: this.timeout,
      maximumAge: this.maximumAge,
    };
  }
}

const DefaultHTML5GeolocationOptions = new HTML5GeolocationOptions(false, Infinity, 0);

class HTML5GeolocationManager {
  constructor(options = DefaultHTML5GeolocationOptions) {
    if (!(options instanceof HTML5GeolocationOptions)) {
      throw new Error('options must be instance of HTML5GeolocationOptions');
    }

    this.options = options.asOptionsObject();
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (! ('geolocation' in navigator)) {
        reject('Geolocation is not available');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords);
        },
        (error) => {
          reject(error);
        },
        this.options
      );
    });
  }

  getCurrentLocationIfAlreadyAllowed() {
    return new Promise((resolve, reject) => {
      if (!('permissions' in navigator)) {
        reject('Permissions is not available in navigator');
        return;
      }
      navigator.permissions.query({
        name: 'geolocation'
      }).then((permission) => {
        if (permission.state !== 'granted') {
          reject('geolocation permission not granted');
          return;
        }
        this.getCurrentLocation()
          .then((coords) => {
            resolve(coords);
          }).catch(err => reject(err));
      });
    });
  }
}

const DefaultHTML5GeolocationManager = new HTML5GeolocationManager();

export {
  HTML5GeolocationManager,
  HTML5GeolocationOptions,
  DefaultHTML5GeolocationOptions,
  DefaultHTML5GeolocationManager
};
