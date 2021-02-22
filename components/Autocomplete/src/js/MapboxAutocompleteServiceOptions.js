import { AutocompleteServiceOptions } from './AutocompleteServiceOptions';
import { MapboxAutocompleteService } from './MapboxAutocompleteService';

const MapboxAutocompleteResultTypes = Object.freeze({
  COUNTRY: 'country',
  REGION: 'region',
  POSTCODE: 'postcode',
  DISTRICT: 'district',
  PLACE: 'place',
  LOCALITY: 'locality',
  NEIGHBORHOOD: 'neighborhood',
  ADDRESS: 'address',
  POINT_OF_INTEREST: 'poi'
});

class MapboxAutocompleteServiceOptions extends AutocompleteServiceOptions {
  constructor () {
    super();
    this.types = null; // Comma separated string of types within MapboxAutocompleteResultTypes
    this.accessToken = window.mapboxgl?.accessToken; // Requires Mapbox to be loaded before initialization
    this.limit = 5; // Number of results. 10 is the maximum.
    this.proximity = null; // Set in the format 'longitude,latitude' to get results biased to be close to that location
    this.decodeMode = 'mapbox.places';
    this.boundingBox = null; // 'minLon,minLat,maxLon,maxLat'
    this.userLocationBias = false;
  }

  withAccessToken(token) {
    this.accessToken = token;
    return this;
  }

  withCountry(country) {
    this.country = country;
    return this;
  }

  withProximity(proximity) {
    this.proximity = proximity;
    return this;
  }

  withLimit(limit) {
    this.limit = limit;
    return this;
  }

  withEnterpriseVersion() {
    this.decodeMode = 'mapbox.places-permanent';
    return this;
  }

  withTypes(types) {
    this.types = types;
    return this;
  }

  withBoundingBox(boundingBox) {
    this.boundingBox = boundingBox;
    return this;
  }

  withUserLocationBias() {
    this.userLocationBias = true;
    return this;
  }

  build() {
    if (!this.userLocationInfo) {
      throw new Error('a UserLocationInfo instance is required');
    }
    if(this.countryRestrictions > 5) {
      throw new Error('Max Number of restrictions is 5');
    }
    return new MapboxAutocompleteService(this);
  }
}

export {
  MapboxAutocompleteServiceOptions,
  MapboxAutocompleteResultTypes
};
