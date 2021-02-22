import { AutocompleteServiceOptions } from './AutocompleteServiceOptions.js';
import { Autocomplete } from './Autocomplete';
import { SearchForm } from '@yext/components-search-form';

class AutocompleteOptions {
  constructor (formManager) {
    if (!(formManager instanceof SearchForm)) {
      throw new Error('form manager must be instance of SearchForm');
    }

    this.formManager = formManager;
    this.form = formManager.formElement;
    this.input = formManager.searchElement;
  }

  withAutocompleteServiceOptions(service) {
    if (!(service instanceof AutocompleteServiceOptions)) {
      throw new Error('must be an autocomplete service');
    }
    this.autocompleteServiceOptions = service;
    return this;
  }

  build() {
    return new Autocomplete(this);
  }
}

export {
  AutocompleteOptions
};
