import URI from 'urijs';
import Raven from 'raven-js/dist/raven.js';
import { SpinnerModal } from '@yext/components-spinner-modal';

import {
  components__Reviews__ReviewForm_new,
  components__Reviews__ReviewForm_edit,
  components__Reviews__ReviewForm_title,
  components__Reviews__ReviewForm_invalidAlert
} from '../templates/ReviewForm.soy';


export function runReviews(grecaptchaKey) {
  const urlParams = new URI(window.location).search(true);
  const dataElement = document.getElementById('js-reviews-params')
  const wrapperElement = document.querySelector('.c-reviews-form-wrapper');
  const targetElement = document.querySelector('.c-reviews-form-target');
  const spinner = new SpinnerModal(wrapperElement);

  if (!dataElement) {
    return console.error('Missing data. You must call components.Reviews.ReviewForm_params in soy on this page if you want Reviews to work.');
  }
  const reviewsParams = JSON.parse(dataElement.innerHTML);
  const errorParams = { result: 'error', ...reviewsParams.errorParams };
  const successParams = { result: 'success', ...reviewsParams.successParams };

  const { invitationId } = urlParams;

  Raven.setUserContext({
    invitationId,
    edit: 'edit' in urlParams
  });

  function success() {
    targetElement.innerHTML = components__Reviews__ReviewForm_title(successParams);
    spinner.hideSpinner();
  }

  function error() {
    targetElement.innerHTML = components__Reviews__ReviewForm_title(errorParams);
    spinner.hideSpinner();
  }

  if (invitationId && 'edit' in urlParams) {
    spinner.showSpinner();
    fetch('https://www.locationrater.com/surveyapi/' + invitationId)
      .then(response => response.ok ? response.json().then(data => {
        if (data.errors || data.error) {
          Raven.captureException(data.errors || data.error);
          error();
        } else {
          targetElement.innerHTML = components__Reviews__ReviewForm_edit({
            ...reviewsParams.editReviewFormParams,
            reviewText: data.content,
            rating: data.rating
          });
          addSubmitListener(invitationId, true);
        }
        spinner.hideSpinner();
      }) : error());
  } else if (invitationId) {
    targetElement.innerHTML = components__Reviews__ReviewForm_new(reviewsParams.newReviewFormParams);
    addSubmitListener(invitationId);
  }

  function addSubmitListener(invitationId, editMode) {
    const formElement = document.querySelector('.c-reviews-form');
    const recaptchaTarget = document.querySelector('.js-recaptcha-target');
    const submitElement = document.querySelector('.c-reviews-form-submit');

    grecaptcha.ready(() => {
      grecaptcha.execute(grecaptchaKey)
        .then(token => recaptchaTarget.value = token);
    });

    formElement.addEventListener('submit', e => {
      e.preventDefault();

      if (!formElement.checkValidity()) {
        return alert(components__Reviews__ReviewForm_invalidAlert());
      }

      submitElement.disabled = true;
      spinner.showSpinner();
      fetch('https://www.locationrater.com/surveyapi/' + invitationId, {
        method: editMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: JSON.stringify(
          Object.assign(
            ...Array.from(new FormData(formElement).entries())
              .map(entry => ({[entry[0]]: entry[1]}))
          )
        )
      }).then(response => response.ok ? success() : error());
    });
  }
}
