import { AutocompleteServiceOptions } from './AutocompleteServiceOptions';
import { GoogleAutocompleteService } from './GoogleAutocompleteService';
import { components__Autocomplete__Autocomplete_googleAttribution } from '../templates/Autocomplete.soy';

const GoogleAutocompleteResultTypes = Object.freeze({
  GEOCODE: 'geocode',
  ADDRESS: 'address',
  ESTABLISHMENT: 'establishment',
  REGIONS: 'regions',
  CITIES: 'cities'
});

class GoogleAutocompleteServiceOptions extends AutocompleteServiceOptions {
  constructor (options) {
    super(options);
    this.types = [GoogleAutocompleteResultTypes.GEOCODE];
    this.strictBounds = false;
    this.radius = null;
    this.boundingBox = null; //object with north, south, east, west

    const soyString = components__Autocomplete__Autocomplete_googleAttribution({
      darkMode : false,
      baseUrl : Yext.baseUrl
    });
    this.attribution = document.createRange().createContextualFragment(soyString);
    this.attrEl = this.attribution.querySelector('.c-Autocomplete-placesAttrEl');
  }

  withRadius(radius) {
    this.radius = radius;
    return this;
  }

  withTypes(type) {
    this.types = type;
    return this;
  }

  withStrictBounds(bool) {
    this.strictBounds = bool;
    return this;
  }

  withBoundingBox(boundingBox) {
    this.boundingBox = boundingBox;
    return this;
  }

  build() {
    if (!this.userLocationInfo) {
      throw new Error('a UserLocationInfo instance is required');
    }
    if(this.countryRestrictions > 5) {
      throw new Error('Max Number of restrictions is 5');
    }
    return new GoogleAutocompleteService(this);
  }
}

export {
  GoogleAutocompleteServiceOptions
};
