import createFocusTrap from 'focus-trap';

export class Modal {
  constructor(modalIdentifier = '.js-Modal') {
    if (modalIdentifier instanceof Element || modalIdentifier instanceof HTMLDocument) {
      this.el = modalIdentifier;
    } else {
      this.el = document.querySelector(modalIdentifier);
    }
    this.config = this.el.dataset;
    this.openCallbacks = [];
    this.closeCallbacks = [];
    this.focusTrap = createFocusTrap(this.el);
    this.closeButtons = this.el.querySelectorAll('.c-Modal-closeButton');
    const openButtonSelectors = this.config.openButtons.split(" ");
    this.openButtons = openButtonSelectors.reduce((prev, sel) => [...prev, ...Array.from(document.getElementsByClassName(sel))], []);

    for (const button of this.openButtons) {
      button.addEventListener('click', () => {
        this.open();
      });
    }

    for (const button of this.closeButtons) {
      button.addEventListener('click', () => {
        this.close();
      })
    }

    if (this.config.closeOnOutsideClick) {
      this.el.addEventListener('click', (event) => {
        if (event.target == this.el) {
          this.close();
        }
      })
    }
  }

  open() {
    const shouldOpen = this.openCallbacks.reduce((prev, cb) => {
      return cb(this) != false && prev;
    }, true);

    if (shouldOpen) {
      this.el.classList.add('c-Modal-open');
      this.focusTrap.activate();
      if (this.config.overlay) {
        this.el.classList.add('c-Modal-overlay')
      }
    }
  }

  close() {
    for (const cb of this.closeCallbacks) {
      cb(this);
    }

    this.el.classList.remove('c-Modal-open');
    this.focusTrap.deactivate();
    if (this.config.overlay) {
      this.el.classList.remove('c-Modal-overlay');
    }
  }

  addOpenCallback(cb) {
    this.openCallbacks.push(cb);
  }

  addCloseCallback(cb) {
    this.closeCallbacks.push(cb);
  }
}
