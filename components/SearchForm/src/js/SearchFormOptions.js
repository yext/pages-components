import { assertInstance } from '@yext/components-util';
import { SearchForm } from './SearchForm.js';
import { QueryType } from './QueryType.js';
import {
  RawQueryOptions,
  GeocodedQueryOptions,
  CountryQueryOptions,
  PostalCodeQueryOptions,
  RegionQueryOptions
} from './StandardQueryTypes.js';

function querySelectorAndValidate(possibleSelector, tagType, scope) {
  if (typeof possibleSelector === 'string') {
    let possibleSelectorEl = scope.querySelector(possibleSelector);
    if (!possibleSelectorEl) {
      throw new Error (`Could not find ${possibleSelector} in ${scope}`);
    }

    if (possibleSelectorEl.tagName.toLowerCase() !== tagType) {
      throw new Error(`${possibleSelector} must be a ${tagType} element`);
    }

    possibleSelector = possibleSelectorEl;
  } else if (!(typeof possibleSelector === 'object' &&
    possibleSelector instanceof HTMLElement &&
    possibleSelector.tagName.toLowerCase() === tagType)) {
    throw new Error(`${possibleSelector} must be a ${tagType} element or selector`);
  }

  return possibleSelector;
}

class SearchFormOptions {
  constructor(form, search, scope = document) {
    this.externalInputs = [];
    this.formElement = querySelectorAndValidate(form, 'form', scope);
    this.prettyQueryParameter = 'qp';
    this.languageParameter = 'l';
    this.searchElement = querySelectorAndValidate(search, 'input', scope);

    this.queryTypes = new Map();

    // Standard Query Types
    this.rawQueryOptions = new RawQueryOptions();
    this.geocodedQueryOptions = new GeocodedQueryOptions();
    this.countryQueryOptions = new CountryQueryOptions();
    this.postalCodeQueryOptions = new PostalCodeQueryOptions();
    this.regionQueryOptions = new RegionQueryOptions();

    if (this.searchElement.name) {
      this.withDefaultQueryParameter(this.searchElement.name);
    }
  }

  /**
   * externalInputs: Array[DOMNode]
   * An array of inputs not in formElement that should be included in query
   * When passing to SearchFormOptions.withExternalInputs, can be any iterable
   * object, such as a NodeList from document.querySelectorAll().
   * Calling withExternalInputs() more than once will add the new elements
   * without removing the ones from previous calls.
   */
  withExternalInputs(inputs) {
    this.externalInputs.push(...inputs);
    return this;
  }

  withPrettyQueryParameter(name) {
    this.prettyQueryParameter = name;
    return this;
  }

  withLanguageParam(name) {
    this.languageParameter = name;
    return this;
  }

  withDefaultQueryParameter(name) {
    this.rawQueryOptions.withParam(name);
    this.geocodedQueryOptions.withParam(name);
    return this;
  }

  withCountryQueryParameter(name) {
    this.countryQueryOptions.withCountryParam(name);
    this.regionQueryOptions.withCountryParam(name);
    return this;
  }

  withRegionQueryParameter(name) {
    this.regionQueryOptions.withRegionParam(name);
    return this;
  }

  /**
   * queryTypes: Map[string] => QueryType
   * All known query types that the form can search by
   * The string key is a unique ID for the type, such as ‘COUNTRY’ for CountryQuery
   * SearchFormOptions.withQueryType adds a single query type (an instance of
   * QueryType) with the given typeID string, which can be used with searchByType
   * Standard query types provided by default are RAW, GEOCODED, COUNTRY, and REGION
   */
  withQueryType(queryType, typeID) {
    assertInstance(queryType, QueryType);

    this.queryTypes.set(typeID, queryType);
    return this;
  }

  build() {
    this.queryTypes.set('RAW', this.rawQueryOptions.build());
    this.queryTypes.set('GEOCODED', this.geocodedQueryOptions.build());
    this.queryTypes.set('COUNTRY', this.countryQueryOptions.build());
    this.queryTypes.set('POSTALCODE', this.postalCodeQueryOptions.build());
    this.queryTypes.set('REGION', this.regionQueryOptions.build());

    return new SearchForm(this);
  }
}

export {
  SearchFormOptions
};
