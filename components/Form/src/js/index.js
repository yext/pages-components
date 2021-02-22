import { Captcha } from '@yext/components-google-recaptcha';
import { SpinnerModal } from '@yext/components-spinner-modal';

export class Form {
  constructor(formElement, captcha, submitCallback) {
    if (!formElement) {
      console.warn('No form element found');
      return;
    }

    if (!(captcha instanceof Captcha)) {
      console.warn('Pass a valid Captcha instance');
      return;
    }

    if (typeof submitCallback !== 'function') {
      console.warn('Pass a valid callback function');
      return;
    }

    if (typeof grecaptcha == 'undefined') {
      console.warn('No grecaptcha script detected on page');
      return;
    }

    this.formElement = formElement;
    this.formContainer = formElement.querySelector('.js-form-container');
    this.captcha = captcha;
    this.submitCallback = submitCallback;

    if (this.formContainer && this.formElement.dataset.spinner == 'true') {
      this.spinner = new SpinnerModal(this.formContainer);
    }

    this.formElement.addEventListener('submit', evt => {
      if (this.spinner) this.spinner.showSpinner();
      this.submitForm(evt).finally(() => {
        if (this.spinner) this.spinner.hideSpinner();
      })
    });
  }

  // Prevent default submission, validate google recaptcha,
  // and call the passed in callback if the google recaptcha is successful
  async submitForm(evt) {
    evt.preventDefault();

    const token = await this.captcha.getNewToken();
    const resp = await this.captcha.validateUser(token);

    if (resp.Verified) {
      await this.submitCallback();
    } else {
      console.warn('Failed Google Re-Captcha verification.');
    }
  }
}
