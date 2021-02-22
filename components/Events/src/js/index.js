class CalendarEvent {
  constructor(el) {
    this.startDate = new Date(el.dataset.eventStart*1000);
    this.endDate = new Date(el.dataset.eventEnd*1000);
    if(this.endDate.getTime() === new Date(0).getTime()) {
      this.endDate = new Date(this.startDate.getTime());
      this.endDate.setHours(23,59,59,9999);
    }
    this.element = el;
  }

  shouldDisplay(currentDate) {
    return currentDate < this.endDate;
  }
}

export class CalendarEventList {
  static initClass(scope = document) {
    for (let list of scope.querySelectorAll('.EventList-wrapper')) {
      list.CalendarEventList = new CalendarEventList(list);
    }
  }

  constructor(el) {
    this.eventsToDisplay = el.dataset.eventsToDisplay;
    if (this.eventsToDisplay == null) {
      this.eventsToDisplay = 1000; // display them all by default (within reason)
    }
    this.eventsDisplayed = 0;
    this.events = [];
    this.today = new Date();
    this.element = el;
    for (let e of el.querySelectorAll('.EventList-event')) {
      e.CalendarEvent = new CalendarEvent(e);

      let remove = !e.CalendarEvent.shouldDisplay(this.today) || this.eventsDisplayed >= this.eventsToDisplay;

      if (remove) {
        e.parentElement.removeChild(e);
      } else {
        this.eventsDisplayed++;
      }
    }
    if (this.eventsDisplayed === 0) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}

