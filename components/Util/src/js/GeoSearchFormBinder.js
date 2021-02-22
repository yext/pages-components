import { HTML5Geolocation } from './Html5Geolocation.js';
import { SpinnerModal } from '@yext/components-spinner-modal';

export class GeoSearchFormBinder {

  constructor(input, form, submitHandler, spinnerParent) {
    this.input = input;
    this.form = form;
    this.useSpinner = spinnerParent != undefined;
    this.running = false;

    // Google's example values
    const geoLocationOptions = {
      "timeout": 5 * 1000,
      "maximumAge":  5 * 60 * 1000,
    };

    HTML5Geolocation.initClass(geoLocationOptions);

    if (typeof submitHandler === 'function') {
      this.submitHandler = submitHandler;
    } else {
      console.warn('the submit handler should be a function, was: ', typeof submitHandler);
    }

    if (this.useSpinner) {
      this.spinner = new SpinnerModal(spinnerParent);
    }
  }

  fillPosition(position) {
    if ('latitude' in position && 'longitude' in position) {
      let query = `${position.latitude},${position.longitude}`;
      this.input.name = 'qp';
      let q = document.createElement('input');
      q.name ='q';
      q.type = 'hidden';
      q.value = query;
      this.form.appendChild(q);
      if (this.submitHandler) {
        this.submitHandler();
        return
      }
      // This will not get fired if you provide a submitHandler function.
      // It's useful because browsers do not fire the 'submit' event when form
      // submits are triggered via javascript.  So if you need to do something
      // with the form before it submits, pass a submitHandler!!!!!!
      this.form.submit();
    }
  }

  geolocateAndSearch() {
    if (this.running) return;
    this.running = true;
    if (this.useSpinner) {
      this.spinner.showSpinner();
    }

    this.form.classList.add('js-geolocating');
    document.body.classList.add('js-geolocating');

    HTML5Geolocation.geolocate(this.geoLocationSuccess.bind(this), this.geoLocationFailure.bind(this));
  }

  geoLocationSuccess(position) {
    this.running = false;
    this.fillPosition(position);
  }

  geoLocationFailure(error) {
    this.running = false;

    if (error.code == error.PERMISSION_DENIED) {
      console.warn(error.message);
    } else {
      alert('Sorry, we could not geolocate you at this time');
    }

    console.error(error);

    Array.from(document.getElementsByClassName('js-geolocating')).forEach(function(element) {
      element.classList.remove('js-geolocating');
    });

    if (this.useSpinner) {
      this.spinner.hideSpinner();
    }
  }
}
