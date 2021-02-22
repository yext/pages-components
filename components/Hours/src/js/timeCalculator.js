import { IntToDay } from './helpers.js';

export class TimeCalculator {
  static getYextDay(date) {
    return IntToDay(date.getDay());
  }

  static getYextTime(date) {
    return date.getHours() * 100 + date.getMinutes();
  }

  /**
   * Calculates a yext time and date using utc offsets
   * If no valid utc offsets are found, time and date will
   * be based off of clients local time.
   *
   * Example
   *
   * Users local time in EDT (now): Fri Jun 21 2019 14:21:10 GMT-0400
   * Their localUtcOffset will be +4 hours (for user offset, +/- is flipped)
   *
   * They are viewing a store in germany, CEST/GMT+2
   * For this date, the utcOffset will be +2 hours (for entity offset, +/- is normal)
   *
   * Adding this together:
   * now + utcOffset + localUtcOffset -> now + 2 hours + 4 hours
   * now = Fri Jun 21 2019 20:21:10 GMT-0400
   *
   * This is technically incorrect, as users local time is not 8PM EDT,
   * its 2PM EDT/8PM CEST, but because our components do not consider
   * timezones at all, this converted date will allow the entity
   * pages to display as if the user was in the same timezone as the entity.
   *
   * @param {Date} now
   * @param {{start: number, offset: number}} utcOffsets
   */
  static calculateYextDayTime(now, utcOffsets) {
    // Get offset data from store page metadata

    // Init UTC offset as just zero
    let utcOffset = 0;

    // Get the UTC offset of the clients timezone (minutes converted to millis)
    const localUtcOffset = now.getTimezoneOffset() * 60 * 1000;

    // If the store has UTC offset data, loop through the data
    if (utcOffsets && utcOffsets.length) {
      for (const offsetPeriod of utcOffsets) {

        // The store offset data is provided as a list of dates with timestamps
        // Only use offsets that are valid, which are offsets that started prior to the current time
        if (offsetPeriod.start * 1000 < now.valueOf()) {
          utcOffset = offsetPeriod.offset * 1000;
        }
      }
    }

    // If a valid offset was found, set the today value to a new date that accounts for the store & local UTC offsets
    if (utcOffset !== 0) {
      now = new Date(now.valueOf() + utcOffset + localUtcOffset);
    }

    const time = this.getYextTime(now);
    const day = this.getYextDay(now);

    return {time, day};
  }

}
