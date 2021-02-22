export class Faq {
  static collapseSection(el, answer) {
    answer.offsetHeight;
    answer.style.height = '';
    answer.setAttribute('aria-hidden', 'true');
    el.setAttribute('aria-expanded', 'false');
  }

  static expandSection(el, answer) {
    const answerHeight = answer.scrollHeight;
    answer.style.height = answerHeight + 'px';

    // Replicates arguments.callee in strict mode such that the transition end event
    // occurs only once
    function transitionListener(e) {
      answer.style.height = '';
      answer.removeEventListener('transitionend', transitionListener);
    }
    answer.addEventListener('transitionend', transitionListener);

    answer.setAttribute('aria-hidden', 'false');
    el.setAttribute('aria-expanded', 'true');
  }

  static clickHandler(el, answer) {
    // Get the height of the element's inner content, regardless
    // of current size
    answer.style.height = answer.scrollHeight + 'px';
    el.classList.toggle('is-expanded');

    if (!el.classList.contains('is-expanded')) {
      this.collapseSection(el, answer);
    } else {
      this.expandSection(el, answer);
    }
  }

  static init() {
    for (let el of document.querySelectorAll('.js-faq-list-item')) {
      const toggle = el.querySelector('.js-faq-toggle');
      const answer = el.querySelector('.js-faq-answer');

      if (toggle) {
        answer.style.height = 0;
        toggle.addEventListener('click', () => { this.clickHandler(el, answer); });
      }
    }
  }
}
