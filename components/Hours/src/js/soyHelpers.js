import {
  components__Hours__Helpers_monday,
  components__Hours__Helpers_tuesday,
  components__Hours__Helpers_wednesday,
  components__Hours__Helpers_thursday,
  components__Hours__Helpers_friday,
  components__Hours__Helpers_saturday,
  components__Hours__Helpers_sunday,
} from '../templates/Helpers.soy';

function TranslateDay(day) {
  switch (day) {
    case 'MONDAY': return components__Hours__Helpers_monday();
    case 'TUESDAY': return components__Hours__Helpers_tuesday();
    case 'WEDNESDAY': return components__Hours__Helpers_wednesday();
    case 'THURSDAY': return components__Hours__Helpers_thursday();
    case 'FRIDAY': return components__Hours__Helpers_friday();
    case 'SATURDAY': return components__Hours__Helpers_saturday();
    case 'SUNDAY': return components__Hours__Helpers_sunday();
  }
  return -1;
}

export {
  TranslateDay
};
