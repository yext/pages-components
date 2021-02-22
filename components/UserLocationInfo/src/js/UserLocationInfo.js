import { Coordinate } from '@yext/components-geo';
import { DefaultIPGeolocationManager } from './IPGeolocationManager.js';
import { HTML5GeolocationManager} from './HTML5GeolocationManager.js';
import { UserLocationInfoCache } from './UserLocationInfoCache.js';
import { UserLocationInfoSource, UserLocationInfoType } from './constants.js';

class UserLocationInfoOptions {
  constructor() {
    this.infoType = UserLocationInfoType.Any;
    this.cacheBypass = false;
    this.ipGeoManager = DefaultIPGeolocationManager;
    this.html5GeoManager = new HTML5GeolocationManager();
  }

  withUserLocationInfoType(type) {
    this.infoType = type;
    return this;
  }

  withCacheBypass(bypass) {
    this.cacheBypass = bypass;
    return this;
  }

  withIPGeolocationManager(manager) {
    this.ipGeoManager = manager;
    return this;
  }

  withHTML5GeolocationManager(manager) {
    this.html5GeoManager = manager;
    return this;
  }

  build() {
    return new UserLocationInfo(this);
  }
}

class UserLocationInfo {
  constructor(options) {
    if (!(options instanceof UserLocationInfoOptions)) {
      throw new Error('options must be a UserLocationInfoOptions object');
    }
    this._subscribers = [];
    this._cache = new UserLocationInfoCache();
    this._infoType = options.infoType;
    this._bypassCache = options.cacheBypass;
    this._ipManager = options.ipGeoManager;
    this._html5Manager = options.html5GeoManager;
  }

  updateCache(rawCoordinate, source) {
    const newCoord = new Coordinate(rawCoordinate.latitude, rawCoordinate.longitude);
    if (!this.cache.isEmpty() && this.cache.coordinate.equals(newCoord)) {
      return;
    }
    this.cache.update(newCoord, source);
    this._subscribers.forEach(cb => cb(this.cache.coordinate));
  }

  get cache() {
    return this._cache;
  }

  getUserLocation(infoType = this._infoType) {
    return new Promise((resolve, reject) => {
      if (!this._bypassCache &&
        !this.cache.isEmpty() &&
        this.cache.allowedForInfoType(infoType)) {
        resolve(this.cache.coordinate);
        return;
      }

      switch (infoType) {
        case UserLocationInfoType.Any:
          this._html5Manager.getCurrentLocationIfAlreadyAllowed()
            .then((coordinate) => {
              this.updateCache(coordinate, UserLocationInfoSource.HTML5Geo);
              resolve(this.cache.coordinate);
            })
            .catch(() => {
              this._ipManager.getCurrentLocation().then((coord) => {
                this.updateCache(coord, UserLocationInfoSource.IPAddress);
                resolve(this.cache.coordinate);
              }).catch(err => reject(err));
            });
          break;
        case UserLocationInfoType.IPAddressOnly:
          this._ipManager.getCurrentLocation()
            .then((coordinate) => {
              this.updateCache(coordinate, UserLocationInfoSource.IPAddress);
              resolve(this.cache.coordinate);
            })
            .catch(err => reject(err));
          break;
        case UserLocationInfoType.HTML5IfNoPrompt:
          this._html5Manager.getCurrentLocationIfAlreadyAllowed()
            .then((coordinate) => {
              this.updateCache(coordinate, UserLocationInfoSource.HTML5Geo);
              resolve(this.cache.coordinate);
            })
            .catch(err => reject(err));
          break;
        case UserLocationInfoType.HTML5Only:
          this._html5Manager.getCurrentLocation().then((coord) => {
            this.updateCache(coord, UserLocationInfoSource.HTML5Geo);
            resolve(this.cache.coordinate);
          }).catch(err => reject(err));
          break;
        default:
          reject('unknown UserLocationInfoType: ' + infoType);
      }
    });
  }

  unsubscribeToUpdates(callback) {
    this._subscribers = this._subscribers.filter((cb) => {
      if (cb !== callback) {
        return cb;
      }
    });
  }

  subscribeToUpdates(callback) {
    if (typeof callback !== 'function') {
      throw new Error(`${callback.toLocaleString()} is not a function`);
    }

    this._subscribers.push(callback);
  }
}

const DefaultUserLocationInfo = new UserLocationInfoOptions().build();

export {
  UserLocationInfo,
  UserLocationInfoType,
  UserLocationInfoSource,
  UserLocationInfoOptions,
  DefaultUserLocationInfo
};
