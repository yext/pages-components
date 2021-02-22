/** @namespace Geo */

/**
 * @memberof Geo
 * @enum {Symbol}
 * @property {Symbol} DEGREE
 * @property {Symbol} KILOMETER
 * @property {Symbol} MILE
 * @property {Symbol} RADIAN
 * @readonly
 */
const Unit = Object.freeze({
  DEGREE: Symbol('deg'),
  KILOMETER: Symbol('km'),
  MILE: Symbol('mi'),
  RADIAN: Symbol('r')
});

/**
 * @memberof Geo
 * @enum {Symbol}
 * @property {Symbol} MERCATOR [Mercator Projection]{@link https://en.wikipedia.org/wiki/Mercator_projection} for flat maps of Earth
 * @property {Symbol} SPHERICAL Earth as a sphere, a model approximately equal to the real Earth
 * @readonly
 */
const Projection = Object.freeze({
  MERCATOR: Symbol('mercator'),
  SPHERICAL: Symbol('spherical')
});

/**
 * @memberof Geo
 * @constant {number}
 * @default
 */
const EARTH_RADIUS_MILES = 3959;
/**
 * @memberof Geo
 * @constant {number}
 * @default
 */
const EARTH_RADIUS_KILOMETERS = 6371;

export {
  Unit,
  Projection,
  EARTH_RADIUS_MILES,
  EARTH_RADIUS_KILOMETERS
};
