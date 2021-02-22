export class Accordion {
  /**
   * @param {String} scope: CSS Selector
   * @param {Object} args
   * @param {HTMLNode} args.toggleBtn: Button which toggles the accordion's state
   * @param {HTMLNode} args.collapsibleEl: Element which opens & closes
   * @param {Number} args.active_bpgte: Accordion js only applies at px values >=
   * @param {Number} args.active_bplte: Accordion js only applies at px values <=
   * @param {Boolean} args.defaultCollapsed: default state of the accordion
   */
  constructor(scope, args={}) {
    if (!scope) {
      console.warn('Error: Accordion not initialized - Usage: new Accordion(scope: css Selector, {args}: object)')
      return;
    }

    this.el = scope;

    // [arg.key]: [assign to 'this'] = [default value]
    ({
      toggleBtn: this.toggleBtn = this.el.querySelector('.js-accordion-btn'),
      collapsibleEl: this.collapsibleEl = this.el.querySelector('.js-accordion-collapsible-content'),
      active_bpgte: this.active_bpgte = 0,
      active_bplte: this.active_bplte = null,
      defaultCollapsed: this.defaultCollapsed = () => true,
    } = args);

    if (this.toggleBtn && this.collapsibleEl) {
      // Check the classList for the initial state, and do that
      this.checkAndSetInitialState();

      // Clicking the toggle button should expand/collapse
      this.bindToggleBtnHandler();
    } else {
      console.warn('Error: Accordion not initialized - Required HTML elements not ' +
                   'found. Expected elements with selector \'.js-accordion-btn\' ' +
                   'and \'.js-accordion-collapsible-content, or custom selectors ' +
                   'passed as args.');
    }
  }

  /**
   * @returns {Boolean} whether the Accordion js should be active or not,
   *  depending on the current width of the screen
   */
  isWithinBreakpoints() {
    let upperBP = (this.active_bpgte != null) &&
                  (window.innerWidth >= this.active_bpgte);
    let lowerBP = (this.active_bplte != null) &&
                  (window.innerWidth <= this.active_bplte);

    return upperBP || lowerBP;
  }


  /**
   * Check if the accordion is expanded
   * @returns {Boolean} Whether the accordion is expanded
   */
  isExpanded() {
    const oldDisplay = this.collapsibleEl.style.display;
    // Set "display: block" in case its currently "display: none"
    //  before checking the height
    this.collapsibleEl.style.display = 'block';
    const visibleHeight = this.collapsibleEl.offsetHeight;
    const totalHeight = this.collapsibleEl.scrollHeight;
    // Revert to old "display: ?" value
    this.collapsibleEl.style.display = oldDisplay;
    return Math.abs(visibleHeight - totalHeight) < 2; //sometimes in android & IE11, these values differ by 1 when expanded. On other browser's, they're equal.
  }

  /**
   * Sets the initial state of the accordion based on the arg `this.defaultCollapsed`
   */
  checkAndSetInitialState() {
    if (this.isWithinBreakpoints()) {
      if (this.defaultCollapsed()) {
        this.el.classList.remove('is-expanded');
        this.el.setAttribute('aria-expanded', false);
        this.collapsibleEl.setAttribute('aria-hidden', true);
        this.collapsibleEl.style.height = '0';
      } else {
        this.el.classList.add('is-expanded');
        this.el.setAttribute('aria-expanded', true);
        this.collapsibleEl.setAttribute('aria-hidden', false);
      }
    }
  }

  /**
   * When the button is clicked, toggle the accordion
   */
  bindToggleBtnHandler() {
    this.toggleBtn.addEventListener('click', e => {
      if (this.isWithinBreakpoints()) {
        if (this.el.getAttribute('aria-expanded') == 'true') {
          this.collapse();
        } else {
          this.expand();
        }
      }
    });
  }

  /**
   * Expand the accordion
   */
  expand() {
    if (this.isExpanded()) { return; } // Do nothing if the content is already expanded

    // The .is-expanded class is updated first in both transitions, so attach the
    //  button animation or whatever else is supposed to happen synchronously to this
    this.el.classList.add('is-expanded');
    this.el.setAttribute('aria-expanded', true); // aria-expanded has styles attached
    this.collapsibleEl.setAttribute('aria-hidden', false);

    requestAnimationFrame(() => {
      // Need to get the height dynamically here so the expand/collapse is smooth on all breakpoints
      this.collapsibleEl.style.height = this.collapsibleEl.scrollHeight + 'px';
    });

    // After the transition remove the inline height so the element can
    //  resize itself responsively
    function transitionEndListener(e) {
      if (!e.propertyName === 'height') { return; }
      this.collapsibleEl.removeEventListener('transitionend', afterExpand);
      this.collapsibleEl.style.height = null;
    }
    const afterExpand = transitionEndListener.bind(this);
    this.collapsibleEl.addEventListener('transitionend', afterExpand);
  }

  /**
   * Collapse the accordion
   */
  collapse() {
    if (!this.isExpanded()) { return; } // Do nothing if the content isn't already expanded

    this.el.classList.remove('is-expanded');
    requestAnimationFrame(() => {
      // explicitly set the element's height so we can transition
      //  (can't transition out of height: auto)
      this.collapsibleEl.style.height = this.collapsibleEl.scrollHeight + 'px';

      // On the next frame, start the transition
      requestAnimationFrame(() => {
        this.collapsibleEl.style.height = 0;
      });
    });

    function transitionEndListener(e) {
      if (!e.propertyName === 'height') { return; }
      this.collapsibleEl.removeEventListener('transitionend', afterCollapse);
      this.el.setAttribute('aria-expanded', false); // has display: none attached for WCAG
      this.collapsibleEl.setAttribute('aria-hidden', true);
    }
    const afterCollapse = transitionEndListener.bind(this);
    this.collapsibleEl.addEventListener('transitionend', afterCollapse);
  }
}