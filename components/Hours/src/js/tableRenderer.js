import {
  components__Hours__HoursTable
} from '../templates/HoursTable.soy';

class TableRenderer {
  static render({ hoursTable }) {
    this.sortFromToday(hoursTable);
    this.applyOpenToday(hoursTable);
  }

  static applyOpenToday(hoursTable) {
    for (let row of hoursTable.element.querySelectorAll('.js-day-of-week-row')) {
      let startIndex = row.dataset.dayOfWeekStartIndex;
      let endIndex = row.dataset.dayOfWeekEndIndex;
      if ((hoursTable.todayIndex >= startIndex) && (hoursTable.todayIndex <= endIndex)) {
        row.classList.add('is-today');
        row.classList.add('js-is-today');
        if (hoursTable.config.showOpenToday) {
          let openTodayTarget = hoursTable.element.querySelector('.js-opentoday');
          if (openTodayTarget) {
            openTodayTarget.styles.display = 'block';
          }
        }
      }
    }
  }

  static sortFromToday(hoursTable) {
    let newTable = document.createElement('div');
    newTable.innerHTML = components__Hours__HoursTable(hoursTable.config);
    let parentNode = hoursTable.element.parentNode;
    let originalEl = hoursTable.element;
    hoursTable.element = newTable.firstChild;
    parentNode.replaceChild(hoursTable.element, originalEl);
  }
}

export { TableRenderer };
