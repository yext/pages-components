export class SpinnerModal {

  constructor(parentElement = document.body) {
    this.parentElement = parentElement;
  }

  showSpinner() {
    this.parentElement.classList.add('SpinnerModal-parent')
    this.parentElement.querySelector('.SpinnerModal').classList.add('SpinnerModal--visible');
  }

  hideSpinner() {
    this.parentElement.classList.remove('SpinnerModal-parent');
    this.parentElement.querySelector('.SpinnerModal').classList.remove('SpinnerModal--visible');
  }
}
