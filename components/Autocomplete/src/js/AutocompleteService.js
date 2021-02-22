class AutocompleteService {
  constructor(options) {
    this.countryForLocale = options.countryForLocale;
    this.countryRestrictions = options.countryRestrictions;
    this.attrEl = options.attrEl;
    this.userLocationInfo = options.userLocationInfo;
    this.disablePostalSearch = options.disablePostalSearch;
    this.disableRegionSearch = options.disableRegionSearch;
  }

  getPredictions(query) {
    throw new Error('Not implemented');
  }

  getPredictionAt(index) {
    throw new Error('Not implemented');
  }
}
export {
  AutocompleteService
};
