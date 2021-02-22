import { ReviewsCarousel } from './ReviewsCarousel.js';

export class Reviews {
  static initClass(domScope) {
    this.autoRunInstances = true;
    this.instances = [];
    this.dom = domScope || document;
  }

  static loadReviewsData() {
    for (let el of this.dom.querySelectorAll('.c-Reviews')) {
      el.reviewsCarousel = new ReviewsCarousel(el);
      this.instances.push(el);
    }
  }

  static runInstances() {
    return Array.from(this.instances).map((instanceElement) =>
      instanceElement.reviewsCarousel.run());
  }

  static loadAndRun() {
    this.loadReviewsData();
    this.runInstances();
  }
}

