import { Debug } from '@yext/components-util';
import { CalcEventNameMap } from './Helpers.js';

function PrintEvents(yaInstance) {
  if (!Debug.isEnabled()) return;
  for (const name of Array.from(CalcEventNameMap(yaInstance).keys())) {
    console.log(name);
  }
}

function Warn(target) {
  if (!Debug.isEnabled()) return;
  console.warn('could not track element', target);
}

function PrintEvent(eventName) {
  if (!Debug.isEnabled()) return;
  console.log(`%c[YextAnalytics]%c- Fired event: ${eventName}`, 'background: white; color: blue;', '');
}

export {
  PrintEvent,
  PrintEvents,
  Warn
};
