import { Type, assertType, assertInstance } from '@yext/components-util';
import { QueryTypeOptions } from './QueryType.js';

// Simple Query
class SimpleQueryTypeOptions {
  constructor() {
    this.params = [];
  }

  /**
   * params: Array[string]
   * An array of param names
   * The order of the params in this array is the order of the arguments for buildQuery
   */
  withParams(params) {
    assertInstance(params, Array);
    params.forEach(param => assertType(param, Type.STRING));

    this.params = params;
    return this;
  }

  build() {
    function buildQuery(...queryValues) {
      // If there are fewer query values than params, truncate the list of params
      // Then assign each param to the value at the same index, e.g. 'param1=val1', 'param2=val2'
      // Finally, join them together: 'param1=val1&param2=val2'
      return this.params
        .slice(0, queryValues.length)
        .map((param, i) => `${param}=${encodeURI(queryValues[i])}`)
        .join('&');
    }

    return new QueryTypeOptions()
      .withParams(this.params)
      .withBuildQueryFunction(buildQuery.bind(this))
      .build();
  }
}

// Raw Query
// Build function: buildQuery(query)
class RawQueryOptions {
  constructor() {
    this.param = 'q';
  }

  withParam(name) {
    this.param = name;
    return this;
  }

  build() {
    return new SimpleQueryTypeOptions()
      .withParams([this.param])
      .build();
  }
}

// Geocoded Query
// Build function: buildQuery(positionString)
class GeocodedQueryOptions extends RawQueryOptions {}

// Country Query
// Build function: buildQuery(isoCountryCode)
class CountryQueryOptions {
  constructor() {
    this.countryParam = 'country';
  }

  withCountryParam(name) {
    this.countryParam = name;
    return this;
  }

  build() {
    return new SimpleQueryTypeOptions()
      .withParams([this.countryParam])
      .build();
  }
}

// Region Query
// Build function: buildQuery(isoRegionCode, isoCountryCode)
class RegionQueryOptions extends CountryQueryOptions {
  constructor() {
    super();

    this.regionParam = 'region';
  }

  withRegionParam(name) {
    this.regionParam = name;
    return this;
  }

  build() {
    return new SimpleQueryTypeOptions()
      .withParams([this.regionParam, this.countryParam])
      .build();
  }
}

// Postal Code Query
// Build function: buildQuery(postalCode)
class PostalCodeQueryOptions extends CountryQueryOptions {
  constructor() {
    super();

    this.postalCodeParam = 'postalCode';
  }

  withCountryParam(code) {
    this.postalCodeParam = code;
    return this;
  }

  build() {
    return new SimpleQueryTypeOptions()
      .withParams([this.postalCodeParam, this.countryParam])
      .build();
  }
}

export {
  SimpleQueryTypeOptions,
  RawQueryOptions,
  GeocodedQueryOptions,
  CountryQueryOptions,
  PostalCodeQueryOptions,
  RegionQueryOptions
};
