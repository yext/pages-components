import 'script-loader!node_modules/slick-carousel/slick/slick.js';
import {
  components__Reviews__Reviews_controlsLinkPrevious,
  components__Reviews__Reviews_controlsLinkSeparator,
  components__Reviews__Reviews_controlsLinkNext
} from '../templates/Reviews.soy';

export class ReviewsCarousel {
  constructor(element, opts) {
    this.element = element;
    this.carouselElement = element.querySelector('.c-ReviewsList')
    this.opts = opts || {};


    let elOpts = {
      showDesktop: this.carouselElement.dataset.showdesktop,
      showMobile: this.carouselElement.dataset.showmobile,
      total: this.carouselElement.dataset.total,
      mobileBreakpoint: this.carouselElement.dataset.mobilebreakpoint,
    };

    this.opts = Object.assign(this.opts, elOpts);
  }

  initCarousel() {
    $(this.carouselElement).slick({
      rows: this.opts.showDesktop,
      cssEase: 'ease-in-out',
      draggable: true,
      fade: false,
      infinite: false,
      adaptiveHeight: true,
      appendArrows:  this.element.querySelector('.c-ReviewsControls'),
      prevArrow: components__Reviews__Reviews_controlsLinkPrevious(),
      nextArrow: components__Reviews__Reviews_controlsLinkSeparator() + components__Reviews__Reviews_controlsLinkNext(),
      responsive: [
        {
          breakpoint: this.opts.mobileBreakpoint,
          settings: {
            rows: this.opts.showMobile
          }
        }
      ]}
    );
  }

  processCarouselPaging() {
    const element = this.element;
    if (window.screen.width < this.opts.mobileBreakpoint) {
      element.querySelector('.js-ReviewsPage-showing').innerHTML = "1 -" + this.opts.showMobile;
    }

    $(this.carouselElement).on('afterChange', (event, slick, currentSlide) => {
      let currRows = slick.slickGetOption('rows');
      let small = (currRows * currentSlide) + 1;
      let large = currRows * (currentSlide + 1);
      if (this.opts.total < large) { large = this.opts.total; }
      if (small == large) {
        element.querySelector('.js-ReviewsPage-showing').innerHTML = "review " + this.opts.total;
      } else {
        element.querySelector('.js-ReviewsPage-showing').innerHTML = "reviews " + small + " - " + large;
      }
    });
  }

  run() {
    this.initCarousel()
    this.processCarouselPaging()
  }
}
