import Raven from 'raven-js/dist/raven.js';
import URI from 'urijs';
import { Type, assertType, assertInstance } from '@yext/components-util';
import { SearchForm } from '@yext/components-search-form';

const fetchGetJSON = {
  method: 'GET',
  credentials: 'same-origin',
  headers: {
    'Accept': 'application/json'
  }
};

class OracleOptions {
  constructor(searchForm) {
    assertInstance(searchForm, SearchForm);

    this.searchForm = searchForm;
    this.beforeSubmit = async () => {};
    this.errorHandler = err => console.error(err);
    this.finalHandler = () => {};
    this.submitCallback = data => {};
  }

  /**
   * beforeSubmit: function()
   * Function called before submission to do any required search setup
   */
  withBeforeSubmit(cb) {
    assertType(cb, Type.FUNCTION);

    this.beforeSubmit = cb;
    return this;
  }

  /**
   * errorHandler: function(error)
   * Function called to handle submission error
   */
  withErrorHandler(cb) {
    assertType(cb, Type.FUNCTION);

    this.errorHandler = cb;
    return this;
  }

  /**
   * finalHandler: function()
   * Function called after submission whether successful or not
   */
  withFinalHandler(cb) {
    assertType(cb, Type.FUNCTION);

    this.finalHandler = cb;
    return this;
  }

  /**
   * submitCallback: function(data)
   * Function called with the results of a submission search
   */
  withSubmitCallback(cb) {
    assertType(cb, Type.FUNCTION);

    this.submitCallback = cb;
    return this;
  }

  build() {
    return new Oracle(this);
  }
}

class Oracle {
  /**
   * static async getAllResults(data, limit = Infinity) => data
   * limit is the maximum number of results, including results from the given data
   */
  static async getAllResults(data, limit = Infinity) {
    if (!(
      data
      && data.response
      && data.response.count
      && data.response.entities
      && data.searchURL
    )) {
      return data;
    }

    const searches = [Promise.resolve(data)];
    const per = 50; // Max number of entities allowed per response
    const totalEntities = Math.min(data.response.count, limit);
    const searchURI = new URI(data.searchURL)
      .removeQuery('per')
      .addQuery('per', per);

    for (let count = data.response.entities.length; count < totalEntities; count += per) {
      if (count + per > limit) {
        searchURI.removeQuery('per').addQuery('per', limit - count);
      }

      searches.push(this.search(searchURI
        .removeQuery('offset')
        .addQuery('offset', count)
        .toString()
      ));
    }

    return Promise.all(searches).then(responses => {
      data.response.entities = responses
        .reduce((allEntities, newData) => allEntities.concat(newData.response.entities), []);
      return data;
    });
  }

  /**
   * static async search(searchURL) => data
   * Requests JSON from searchURL
   */
  static async search(searchURL) {
    try {
      const response = await fetch(searchURL, fetchGetJSON);
      const data = await response.json();
      data.searchURL = data.searchURL || searchURL;
      return data;
    } catch(err) {
      if (Raven.isSetup()) {
        Raven.captureException(err, {
          extra: { queryString: searchURL }
        });
      }
      throw err;
    }
  }

  constructor(options) {
    assertInstance(options, OracleOptions);

    this._beforeSubmit = options.beforeSubmit;
    this._errorHandler = options.errorHandler;
    this._finalHandler = options.finalHandler;
    this._searchForm = options.searchForm;
    this._submitCallback = options.submitCallback;

    this._searchForm.formElement.addEventListener('submit', this.submitHandler.bind(this));
  }

  /**
   * getSearchForm() => SearchForm
   */
  getSearchForm() {
    return this._searchForm;
  }

  /**
   * submit()
   * calls searchForm.submit()
   */
  submit() {
    this._searchForm.submit();
  }

  /**
   * async submitHandler(e)
   * Submits form with ajax search, where e is optional event
   * Calls static search with searchURL = searchForm.formElement.action + searchForm.buildQuery()
   * Passes search response to submitCallback with added data.searchURL = searchURL
   * and data.query = searchForm.buildQuery()
   * This function is assigned as submit handler to form.
   */
  async submitHandler(e) {
    if (e && typeof e.preventDefault == Type.FUNCTION) {
      e.preventDefault();
    }

    await this._beforeSubmit();

    const query = this._searchForm.buildQuery();
    if (query) {
      const searchURL = new URI(this._searchForm.formElement.action).query(query).toString();
      this.constructor.search(searchURL)
        .then(data => this._submitCallback(Object.assign(data, { query })))
        .catch(this._errorHandler)
        .finally(this._finalHandler);
    } else {
      this._finalHandler();
    }
  }
}

export {
  Oracle,
  OracleOptions
};
