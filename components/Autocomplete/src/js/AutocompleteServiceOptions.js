import { UserLocationInfo } from '@yext/components-user-location-info';

class AutocompleteServiceOptions {
  constructor () {
    this.locale = Yext.locale;
    this.disablePostalSearch = true;
    this.disableRegionSearch = false;
  }

  withUserLocationInfo(info) {
    if(!(info instanceof UserLocationInfo)) {
      throw new Error('This needs to be an instance of UserLocationInfo');
    }
    this.userLocationInfo = info;
    return this;
  }

  withCountriesForLocale(locale, countryCodeList) {
    if (!this.countryForLocale) {
      this.countryForLocale = {[locale] : countryCodeList};
    } else {
      this.countryForLocale[locale] = countryCodeList;
    }
    return this;
  }

  withAlwaysRestrictToCountries(...countries) {
    this.countryRestrictions = Array.from(countries);
    return this;
  }

  withLocale(locale) {
    this.locale = locale;
    return this;
  }

  withAttributionEl(attrEl) {
    this.attrEl = attrEl;
    return this;
  }

  withPostalQueryEnabled() {
    this.disablePostalSearch = false;
    return this;
  }

  withRegionQueryDisabled() {
    this.disableRegionSearch = true;
    return this;
  }

  build() {
    throw new Error('Not implemented');
  }
}

export {
  AutocompleteServiceOptions
};
