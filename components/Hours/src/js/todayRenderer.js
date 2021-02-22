import { TranslateDay } from './soyHelpers.js';
import {
  components__Hours__Helpers_open24Hours,
  components__Hours__Helpers_openClosesAt,
  components__Hours__Helpers_openClosesAtNextInterval,
  components__Hours__Helpers_closedOpensAt,
  components__Hours__Helpers_closedOpensAtNextInterval,
  components__Hours__Helpers_closed,
  components__Hours__Helpers_dayWrapper
} from '../templates/Helpers.soy';

class TodayRenderer {
  static getTodaysMessage({ hoursToday, twentyFourHourClock, timeFormatString }) {
    let template;

    switch (hoursToday.status) {
      case 'OPEN24':
        template = components__Hours__Helpers_open24Hours;
        break;
      case 'OPENSTODAY':
        template = components__Hours__Helpers_closedOpensAt;
        break;
      case 'OPENSNEXT':
        template = components__Hours__Helpers_closedOpensAtNextInterval;
        break;
      case 'CLOSESTODAY':
        template = components__Hours__Helpers_openClosesAt;
        break;
      case 'CLOSESNEXT':
        template = components__Hours__Helpers_openClosesAtNextInterval;
        break;
      case 'CLOSED':
        template = components__Hours__Helpers_closed;
        break;
    }

    if (template) {
      return template({
        day: TranslateDay(hoursToday.nextDay),
        time: hoursToday.nextTime,
        timeFormatString,
        twentyFourHourClock
      });
    }

    return null;
  }

  static render ({ hoursToday, element }) {
    const twentyFourHourClock = element.dataset.twentyFourHourClock === 'true';
    const timeFormatString = element.dataset.timeFormatString;
    const todayMessage = this.getTodaysMessage({ hoursToday, twentyFourHourClock, timeFormatString });
    if (todayMessage == null) {
      element.querySelector(`[data-day-of-week-start-index="${hoursToday.dayIndex}"]`).style.display = 'block';
    } else {
      element.innerHTML = components__Hours__Helpers_dayWrapper({
        content: todayMessage,
        status: hoursToday.status
      });
    }
    element.classList.add('is-loaded');
  }
}

export { TodayRenderer };
