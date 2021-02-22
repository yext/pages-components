import { Modal } from './Modal.js';

// Initializes all modal components on the page
// Allows access to modal instances by querying
// on their respective elements
export class ModalManager {
  constructor(modalIdentifier = '.js-Modal') {
    this.modalIdentifier = modalIdentifier;
    this.modals = [];

    const modalEls = document.querySelectorAll(this.modalIdentifier);
    for (const el of modalEls) {
      this.modals.push(new Modal(el));
    }
  }

  querySelectorAll(selector) {
    return this.modals.filter(modal => {
      return modal.el.matches(selector);
    });
  }

  querySelector(selector) {
    const matches = this.modals.filter(modal => {
      return modal.el.matches(selector);
    });

    return matches.length ? matches[0] : null;
  }
}
