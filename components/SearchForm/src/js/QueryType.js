import { Type, assertType, assertInstance } from '@yext/components-util';

class QueryTypeOptions {
  constructor() {
    this.buildQuery = (...queryValues) => { throw new Error('QueryType: buildQuery must be implemented') };
    this.params = new Set();
  }

  /**
   * buildQuery: function(value1, value2, ..., valueN) => string
   * Function that returns a query string for the given values
   * Number and type of values vary depending on how the QueryType is used
   * E.g. a country query may have one value, country code, and a region query
   * may have two, country code and region code
   */
  withBuildQueryFunction(buildQuery) {
    assertType(buildQuery, Type.FUNCTION);

    this.buildQuery = buildQuery;
    return this;
  }

  /**
   * params: Set[string]
   * A set of all the params that may appear in the query string for this QueryType
   */
  withParams(params) {
    assertInstance(params, Array);
    params.forEach(param => assertType(param, Type.STRING));

    this.params = new Set(params);
    return this;
  }

  build() {
    return new QueryType(this);
  }
}

class QueryType {
  constructor(options) {
    assertInstance(options, QueryTypeOptions);

    this._buildQuery = options.buildQuery;
    this._params = options.params;
  }

  buildQuery(...queryValues) {
    return this._buildQuery(...queryValues);
  }

  params() {
    return this._params;
  }
}

export {
  QueryType,
  QueryTypeOptions
};
