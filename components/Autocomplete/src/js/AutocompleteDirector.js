import { SearchFormOptions } from '@yext/components-search-form';
import { AutocompleteOptions } from './AutocompleteOptions.js';
import { GoogleAutocompleteServiceOptions } from './GoogleAutocompleteServiceOptions.js';
import { MapboxAutocompleteServiceOptions, MapboxAutocompleteResultTypes } from './MapboxAutocompleteServiceOptions.js';
import { DefaultUserLocationInfo } from '@yext/components-user-location-info';

class AutocompleteDirector {
  constructor(form, input) {
    this.searchFormOptions = new SearchFormOptions(form, input);
    this._autocomplete = null;
    this._searchForm = null;
  }

  baseAutocompleteServiceOptions(concreteType) {
    return new concreteType()
      .withLocale(document.documentElement.getAttribute('lang'))
      .withUserLocationInfo(DefaultUserLocationInfo)
  }

  baseAutocompleteOptions(concreteOptions) {
    return new AutocompleteOptions(this.searchForm)
      .withAutocompleteServiceOptions(concreteOptions);
  }

  baseGoogleAutoCompleteOptions(callLoad) {
    return this.baseAutocompleteOptions(
      new this.baseAutocompleteServiceOptions(GoogleAutocompleteServiceOptions)
    );
  }

  baseMapboxAutocompleteOptions() {
    return this.baseAutocompleteOptions(
      new this.baseAutocompleteServiceOptions(MapboxAutocompleteServiceOptions)
    );
  }

  buildIndexAutocomplete() {
    this._searchForm = this.searchFormOptions.build();
    this._autocomplete = this.baseAutocompleteOptions().build();
  }

  setupSearchForm() {
    this._searchForm =
      this.searchFormOptions
      // setting these explicitly to allow for QP swapping on load
        .withPrettyQueryParameter('qp')
        .withDefaultQueryParameter('q')
        .build();
  }

  buildLocatorAutocomplete(options) {
    this._autocomplete = options.build();
  }

  buildGoogleLocatorAutocomplete() {
    this.setupSearchForm();
    this.buildLocatorAutocomplete(this.baseGoogleAutoCompleteOptions(true));
  }

  buildMapboxLocatorAutocomplete() {
    this.setupSearchForm();
    this.buildLocatorAutocomplete(this.baseMapboxAutocompleteOptions());
  }

  get searchForm() {
    if (!this._searchForm) {
      throw new Error('you must call a builder first');
    }
    return this._searchForm;
  }

  get autocomplete() {
    if (!this._autocomplete) {
      throw new Error('you must call a builder first');
    }
    return this._autocomplete;
  }
}

export {
  AutocompleteDirector
};
