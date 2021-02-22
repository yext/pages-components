
export class Description {
  static loadAndRun(scope = document) {
    for (let el of scope.querySelectorAll('.c-description')) {
      el.Description = new Description(el);
    }
  }

  constructor(element) {
    this.element = element;
    Array.from(this.element.querySelectorAll('.js-show-more, .js-show-less'))
    .forEach((toggler) => {
      toggler.addEventListener('click', (e) => {
        this.element.classList.toggle('show-full-description');
        e.preventDefault();
      });
    });
  }
}
