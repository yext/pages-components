import { assertInstance } from '@yext/components-util';
import { AutocompleteOptions } from './AutocompleteOptions.js';
import { PredictionType } from './Predictions.js';
import Raven from 'raven-js/dist/raven.js';
import {
  components__Autocomplete__Autocomplete,
  components__Autocomplete__Autocomplete_srDirections
} from '../templates/Autocomplete.soy';

const KeyCode = Object.freeze({
  UP_ARROW: Symbol('up'),
  DOWN_ARROW: Symbol('down'),
  ENTER: Symbol('enter'),
  ESCAPE: Symbol('escape')
});
const RawCodeMapping = Object.freeze({
  'ArrowUp': KeyCode.UP_ARROW,
  'Up': KeyCode.UP_ARROW,
  38: KeyCode.UP_ARROW,
  'UIKeyInputUpArrow': KeyCode.UP_ARROW,
  'ArrowDown': KeyCode.DOWN_ARROW,
  'Down': KeyCode.DOWN_ARROW,
  40: KeyCode.DOWN_ARROW,
  'UIKeyInputDownArrow': KeyCode.DOWN_ARROW,
  'Enter': KeyCode.ENTER,
  13: KeyCode.ENTER,
  'Escape': KeyCode.ESCAPE,
  '27': KeyCode.ESCAPE,
  'Esc': KeyCode.ESCAPE,
});

function setAttributes(el, attributes) {
  for (let key in attributes) {
    el.setAttribute(key, attributes[key]);
  }
}

class Autocomplete {
  constructor(options) {
    assertInstance(options, AutocompleteOptions);

    const configEl = document.getElementById('js-cobalt-config');
    const config = configEl ? JSON.parse(configEl.innerHTML) : {};

    this.formManager = options.formManager;
    this.form = options.form;
    this.inputEl = options.input;
    this.currentResultIndex = -1;
    this.results = [];
    this.resultElements = [];
    this.attribution = options.autocompleteServiceOptions.attribution;
    this.savedQuery = null;
    this.autocompleteId = config.autocompleteId;
    this.isOpen = false;
    this.setupAutocomplete();
    this.AutocompleteService = options.autocompleteServiceOptions.build();
  }

  /**
   * Call this function to update the query type for the SearchForm
   * Search by country, region, or geocode
   */
  async updateQueryType() {
    const cleanedInputQuery = this.inputEl.value.toLowerCase().trim();
    this.currentResultIndex = this.results.indexOf(this.results.find(result => result.name.toLowerCase().trim() === cleanedInputQuery));

    if (this.currentResultIndex != -1) {
      // select first option on exact match
      await this.AutocompleteService.getPredictionAt(this.currentResultIndex)
        .then(prediction => {
          if (prediction.type === PredictionType.COUNTRY) {
            this.formManager.searchByCountry(prediction.name, prediction.isoCountryCode);
          } else if (prediction.type === PredictionType.REGION) {
            this.formManager.searchByRegion(prediction.name, prediction.isoRegionCode, prediction.isoCountryCode);
          } else if (prediction.type === PredictionType.POSTALCODE) {
            this.formManager.searchByPostalCode(prediction.name, prediction.postalCode, prediction.isoCountryCode);
          } else {
            this.formManager.searchByGeocode(prediction.name, prediction.coordinate.searchQueryString());
          }
        })
        .catch(err => {
          console.error(err);
          if (Raven.isSetup()) {
            Raven.captureException(err, {
              extra: {
                details: 'Error Updating Query Parameters'
              }
            });
          }
        });
    }
  }

  handleInput() {
    //Pressing the escape key clears the form before we reach this handler and it does not trigger a keyup event

    const query = this.inputEl.value;

    if (query) {
      this.AutocompleteService.getPredictions(query)
        .then(results => {
          if (this.inputEl.value === query) {
            this.renderAutocomplete(results);
          }
        })
        .catch(err => {
          if (this.inputEl.value === query) {
            this.closeResults();
          }

          console.log(err);
          Raven.captureException(err, {
            extra: {
              details: 'Autocomplete Input Handler'
            }
          });
        });
    } else {
      //If there is no query we dont render anything in the DOM
      this.renderAutocomplete([]);
    }
  }

  handleSelection(evt, target) {
    if (evt.type === 'click') {
      const autocompleteElement = evt.target.closest('.c-Autocomplete-item');
      this.inputEl.value = autocompleteElement.innerText;
      this.currentResultIndex = parseInt(autocompleteElement.dataset.index);
      this.formManager.submit();
      this.closeResults();
      return;
    }

    switch (this.getKeyCode(evt)) {
      case KeyCode.UP_ARROW:
        this.setActiveResult(this.currentResultIndex - 1);
        break;
      case KeyCode.DOWN_ARROW:
        this.setActiveResult(this.currentResultIndex + 1);
        break;
      case KeyCode.ESCAPE:
        evt.preventDefault();
        this.closeResults(true);
    }
  }

  setUpEventListeners() {
    this.inputEl.addEventListener('input', this.handleInput.bind(this));
    this.inputEl.addEventListener('keydown', this.handleSelection.bind(this));
    this.form.addEventListener('submit', () => this.closeResults());
  }

  setupAutocomplete() {
    setAttributes(this.inputEl, {
      'autocomplete': 'off',
      'aria-expanded': 'false',
      'aria-autocomplete': 'both',
      'aria-activedescendant': '',
      'aria-owns': 'results',
      'aria-describedby': this.autocompleteId ? this.autocompleteId : 'initInstr'
    });

    const soyString = components__Autocomplete__Autocomplete({id: this.autocompleteId});
    const frag = document.createRange().createContextualFragment(soyString);
    this.form.appendChild(frag);
    this.screenReaderText = this.form.querySelector('.c-Autocomplete-ariaResults');
    this.autocompleteEl = this.form.lastChild;
    this.autocompleteListEl = this.autocompleteEl.querySelector('.c-Autocomplete-list');
    this.attrContainer = this.autocompleteEl.querySelector('.c-Autocomplete-attrContainer');
    if (this.attrContainer && this.attribution) {
      this.attrContainer.appendChild(this.attribution);
    }
    this.setUpEventListeners();
  }

  /**
   * Returns keycode in a browser / device compatible way
   */
  getKeyCode(event) {
    const code = event.key || event.keyCode || event.which;
    return RawCodeMapping[code];
  }

  /**
   * results: an array of ShortPredictions
   */
  renderAutocomplete(results) {
    if (results.length) {
      this.openResults();
    } else {
      this.closeResults();
    }

    this.currentResultIndex = -1;
    this.results = results;
    this.resultElements = [];

    while (this.autocompleteListEl.firstChild) {
      this.autocompleteListEl.removeChild(this.autocompleteListEl.firstChild);
    }

    for (const result of results) {
      const resultEl = this.createElWithAttributes('li', {
        'id': '',
        'class': 'c-Autocomplete-item',
        'role': 'option',
        'aria-selected': 'false',
        'tab-index': '-1',
        'data-index': results.indexOf(result)
      });
      resultEl.innerHTML = this.getHighlightedResult(result);
      resultEl.addEventListener('click', (e) => {
        this.handleSelection(e, resultEl);
      });
      this.resultElements.push(resultEl);
      this.autocompleteListEl.appendChild(resultEl);
    }

    this.srAnnounceResults();

    // This fixes a bug in Chrome that happens if the autocomplete is inside a
    // container with fixed width that's inside a container with width:auto
    // where the outer container's width would adjust to fit the inner container's
    // width rather than taking up 100% of its parent.
    if (window.chrome) {
      this.autocompleteEl.style.display = 'none';
      requestAnimationFrame(() => this.autocompleteEl.style.display = '');
    }
  }

  getHighlightedResult(result) {
    if (!result.matchedSubStrings) {
      return result.name;
    }

    let str = '';
    let start = 0;
    result.matchedSubStrings.map(match => {
      str+=`${result.name.substring(start, match.offset)}`;
      const end = match.offset + match.length;
      str+=`<span class="c-Autocomplete-matchedSubstr">${result.name.substring(match.offset, end )}</span>`;
      start = end;
    });
    str+=result.name.substring(start);
    return str;
  }

  setActiveResult(index) {
    //if there are no results we dont want to select anything
    if (this.resultElements.length === 0) {
      return;
    }
    //Back to search box if we select an index greater than num results or we select the searchbox
    if (index >= this.resultElements.length || index === -1)  {
      this.closeResults();
      this.clearSelected();
      this.currentResultIndex = -1;
      return;
    } else {
      //go to last result if we go up from search box
      if (index < -1) {
        index = this.resultElements.length -1;
        this.currentResultIndex = index;
      }
      //return if we cant select a result
      if (!this.resultElements[index]) {
        return;
      }
      // if we are here we want to make sure results are open, clear old selected result and select the new result
      this.openResults();
      this.clearSelected();
      this.inputEl.setAttribute('aria-activedescendant', 'selectedOption');
      this.resultElements[index].classList.add('js-hoverState');
      setAttributes(this.resultElements[index], {
        'aria-selected': 'true',
        'id': 'selectedOption'
      });

      if (this.savedQuery === null) {
        this.savedQuery = this.inputEl.value;
      }
      this.inputEl.value = this.resultElements[index].innerText;
      this.currentResultIndex = index; //save the index we are on
    }
  }

  /**
   * Clear selected elements
   */
  clearSelected() {
    this.inputEl.setAttribute('aria-activedescendant', '');
    for (let el of this.resultElements) {
      el.classList.remove('js-hoverState');
      el.setAttribute('aria-selected', false);
      el.id = '';
    }
  }

  /**
   * Close autocomplete results and revert input
   */
  closeResults(revert = false) {
    if (!this.isOpen) {
      return;
    }

    if (revert && this.savedQuery !== null) {
      this.inputEl.value = this.savedQuery;
      this.savedQuery = null;
    }

    this.clearSelected();
    this.inputEl.setAttribute('aria-expanded', 'false');
    this.autocompleteEl.classList.remove('c-Autocomplete--expanded');
    this.isOpen = false;
  }

  /**
   * Open the results by setting the inner style to block
   */
  openResults() {
    if (this.isOpen) {
      return;
    }

    this.positionResults();
    this.inputEl.setAttribute('aria-expanded', 'true');
    this.autocompleteEl.classList.add('c-Autocomplete--expanded');
    this.closeOnOutsideClicks();
    this.isOpen = true;
  }

  positionResults() {
    const formRect = this.form.getBoundingClientRect();
    const inputRect = this.inputEl.getBoundingClientRect();

    this.autocompleteEl.style.top = (inputRect.top - formRect.top + inputRect.height) + 'px';
    this.autocompleteEl.style.left = (inputRect.left - formRect.left) + 'px';
    this.autocompleteEl.style.width = inputRect.width + 'px';
  }

  //Helper function to quickly create html elements
  createElWithAttributes(tagName, attributes) {
    let el = document.createElement(tagName);
    setAttributes(el, attributes);
    return el;
  }

  async srAnnounceResults() {
    let numResults = this.resultElements.length;
    this.screenReaderText.innerText = components__Autocomplete__Autocomplete_srDirections({numResults: numResults});
    setTimeout(() => this.screenReaderText.innerText = '', 1000);
  }

  closeOnOutsideClicks() {
    //Listener to detect clicks outside form
    const listener = evt => {
      //If a user clicks inside the element do nothing
      if (evt.target !== this.inputEl) {
        document.removeEventListener('click', listener);
        this.closeResults();
      }
    };

    document.addEventListener('click', listener);
  }
}

export {
  Autocomplete
};
