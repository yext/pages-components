import URI from 'urijs';
import { assertInstance } from '@yext/components-util';
import { InputHelper } from './InputHelper.js';
import { QueryType } from './QueryType.js';
import { SearchFormOptions } from './SearchFormOptions.js';

class SearchForm {
  constructor(options) {
    assertInstance(options, SearchFormOptions);

    this._externalInputs = options.externalInputs;
    this._formElement = options.formElement;
    this._prettyQueryParameter = options.prettyQueryParameter;
    this._languageParameter = options.languageParameter;
    this._queryTypes = options.queryTypes;
    this._searchElement = options.searchElement;

    this._currentPrettyQuery = this._searchElement.value;
    this._currentQuery = this._removeExtraParams(window.location.search);

    this._searchElement.name = this._prettyQueryParameter;
  }

  get formElement() {
    return this._formElement;
  }

  get searchElement() {
    return this._searchElement;
  }

  /**
   * buildQuery(): string
   * Returns a URL query for the values of the form inputs, such as ‘q=New+York&r=20’
   * If the value of searchElement matches currentPrettyQuery, currentQuery is
   * used. Otherwise a raw search query is used. Any additional inputs in
   * formElement are added to the query string after that.
   * Optionally accepts a boolean to allow for the _searchElement.id param to be empty.
   * Optionally accepts an array of additional parameters for the query with
   * the structure [{name: 'per', value: '50'}]
   */
  buildQuery(allowEmpty = false, extraParams = []) {
    if (this._searchElement.value != this._currentPrettyQuery) {
      this.rawSearch(this._searchElement.value);
    }

    if (!this._currentQuery && !allowEmpty) {
      return '';
    }

    return (this._currentQuery ? [this._currentQuery] : [])
      .concat(Array.from(this._formElement.querySelectorAll('input, select'))
        .concat(this._externalInputs)
        .filter(input => input.name && !InputHelper.isEmpty(input))
        .concat(extraParams)
        .map(input => `${input.name}=${encodeURI(input.value)}`)
        .concat(`${this._languageParameter}=${Yext.locale}`))
      .join('&');
  }

  rawSearch(query) {
    this.searchByType('RAW', query, query);
  }

  searchByCountry(prettyQuery, isoCountryCode) {
    this.searchByType('COUNTRY', prettyQuery, isoCountryCode);
  }

  searchByGeocode(prettyQuery, positionString) {
    this.searchByType('GEOCODED', prettyQuery, positionString);
  }

  searchByPostalCode(prettyQuery, postalCode, isoCountryCode) {
    this.searchByType('POSTALCODE', prettyQuery, postalCode, isoCountryCode);
  }

  searchByRegion(prettyQuery, isoRegionCode, isoCountryCode) {
    this.searchByType('REGION', prettyQuery, isoRegionCode, isoCountryCode);
  }

  /**
   * searchByType(typeName, prettyQuery, ...queryValues)
   * First, the value of searchElement is set to prettyQuery.
   * typeName is a string, the ID of the query type in queryTypes. Standard query
   * types are ‘RAW’, ‘GEOCODED’, ‘COUNTRY’, and ‘REGION’. queryValues are passed
   * to the query type’s build() function to build the query string.
   */
  searchByType(typeName, prettyQuery, ...queryValues) {
    if (!this._queryTypes.has(typeName)) {
      throw new Error(`unknown query type ${typeName}, available types: ${this._knownQueryTypes()}`);
    }

    this._searchElement.value = prettyQuery;
    this._currentPrettyQuery = prettyQuery;
    this._currentQuery = this._queryTypes.get(typeName).buildQuery(...queryValues);
  }

  /**
   * submit()
   * Submits the form
   */
  submit() {
    const submitEvent = document.createEvent('Event');
    submitEvent.initEvent('submit', true, true);
    this._formElement.dispatchEvent(submitEvent);
  }

  _knownQueryTypes() {
    return Array.from(this._queryTypes.keys()).join(', ');
  }

  _removeExtraParams(query) {
    const uri = new URI(query).removeQuery('');
    const allParams = new Set();

    for (const queryType of this._queryTypes.values()) {
      for (const param of queryType.params().keys()) {
        allParams.add(param);
      }
    }

    for (const param of Object.keys(uri.search(true))) {
      if (!allParams.has(param)) {
        uri.removeQuery(param);
      }
    }

    return uri.query();
  }
}

export {
  SearchForm,
  SearchFormOptions
};
