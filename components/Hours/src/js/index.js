import { HoursToday } from './hoursToday.js';
import { HoursTable } from './hoursTable.js';
import { TodayRenderer } from './todayRenderer.js';
import { TableRenderer } from './tableRenderer.js';
import { TimeCalculator } from './timeCalculator.js';

class Hours {
  static loadAndRun({
    //params
    scope = document
  } = {}) {

    const now = new Date();

    for (let element of scope.querySelectorAll('.js-hours-today')) {
      this.renderHoursToday(element, now);
    }

    for (let element of scope.querySelectorAll('.js-hours-table')) {
      this.renderTable(element, now);
    }
  }

  static renderHoursToday(element, now) {
    const utcOffsets = JSON.parse(element.dataset.utcOffsets);
    const { time, day } = TimeCalculator.calculateYextDayTime(now, utcOffsets);
    const hoursToday = HoursToday.fromElement(element, time, day);
    TodayRenderer.render({ hoursToday, element });
  }

  static renderTable(element, now) {
    const utcOffsets = JSON.parse(element.dataset.utcOffsets);
    const { time, day } = TimeCalculator.calculateYextDayTime(now, utcOffsets);
    const hoursTable = new HoursTable({ element, time, day });
    TableRenderer.render({ hoursTable });
  }
}

export { Hours };
