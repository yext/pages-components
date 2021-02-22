import 'whatwg-fetch';
import { url__geocodeIp } from 'templates/url/url.soy';

class IPGeolocationManager {
  constructor() {
    this._urlPath = null;
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      fetch(`${Yext.baseUrl}${url__geocodeIp()}`)
        .then((resp) => {
          if (resp.status < 200 || resp.status > 300) {
            reject(resp.status);
            return;
          }
          resp.json().then((data) => {
            resolve(data);
          });
        }).catch(err => reject(err));
    });
  }
}

const DefaultIPGeolocationManager = new IPGeolocationManager();

export {
  IPGeolocationManager,
  DefaultIPGeolocationManager
};
