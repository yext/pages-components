import { Unit, Projection, EARTH_RADIUS_MILES, EARTH_RADIUS_KILOMETERS } from './constants.js';

/**
 * An array of property names to check in a Coordinate-like object for a value of or function that evaluates to degrees latitude
 * @memberof Coordinate
 * @inner
 * @constant {string[]}
 * @default
 */
const LATITUDE_ALIASES = ['latitude', 'lat'];

/**
 * An array of property names to check in a Coordinate-like object for a value of or function that evaluates to degrees longitude
 * @memberof Coordinate
 * @inner
 * @constant {string[]}
 * @default
 */
const LONGITUDE_ALIASES = ['longitude', 'lon', 'lng', 'long'];

/**
 * Find a truthy or 0 value in an object, searching the given keys
 * @memberof Coordinate
 * @inner
 * @param {Object} object Object to find a value in
 * @param {string[]} keys Keys to search in object
 * @returns {*} The value found, or undefined if not found
 */
function findValue(object, keys) {
  for (const key of keys) {
    if (object[key] || object[key] === 0) {
      return object[key];
    }
  }
}

/**
 * @memberof Coordinate
 * @inner
 * @param {*} value
 * @returns {number}
 * @throws Will throw an error if value cannot be converted to a number.
 */
function forceNumber(value) {
  switch (typeof value) {
    case 'string':
    case 'number':
      const parsed = Number.parseFloat(value);
      if (Number.isNaN(parsed)) {
        throw new Error(`'${value}' must be convertible to a Number'`);
      }
      return parsed;
    default:
      throw new Error(`typeof '${value}' must be a number or a string that can be converted to a number, is '${typeof value}'`);
  }
}

/**
 * @memberof Coordinate
 * @inner
 * @param {number} degrees
 * @returns {number} Radians
 */
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * @memberof Coordinate
 * @inner
 * @param {number} radians
 * @returns {number} Degrees
 */
function radiansToDegrees(radians) {
  return radians / Math.PI * 180;
}

/**
 * Calculate distance between two points using the [Haversine Formula]{@link https://en.wikipedia.org/wiki/Haversine_formula}
 * @memberof Coordinate
 * @inner
 * @param {Coordinate} source
 * @param {Coordinate} destination
 * @returns {number}
 */
function haversineDistance(source, dest) {
  const lat1Rads = degreesToRadians(source.latitude);
  const lat2Rads = degreesToRadians(dest.latitude);
  const deltaLat = lat2Rads - lat1Rads;
  const deltaLon = degreesToRadians(dest.longitude - source.longitude);

  const a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1Rads) * Math.cos(lat2Rads) * Math.pow(Math.sin(deltaLon / 2), 2);
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate the distance between two Mercator-projected latitudes in radians of longitude.
 * In Mercator Projection, visual distance between longitudes is always the same but visual distance
 * between latitudes is lowest at the equator and highest towards the poles.
 * @memberof Coordinate
 * @inner
 * @param {number} latitudeA The source latitude in degrees
 * @param {number} latitudeB The destination latitude in degrees
 * @returns {number} Distance in radians of longitude
 */
function mercatorLatDistanceInRadians(latitudeA, latitudeB) {
  const aTan = Math.tan(Math.PI / 360 * (latitudeA + 90));
  const bTan = Math.tan(Math.PI / 360 * (latitudeB + 90));

  return Math.log(bTan / aTan);
}

/**
 * Add radians of longitude to a Mercator-projected latitude.
 * In Mercator Projection, visual distance between longitudes is always the same but visual distance
 * between latitudes is lowest at the equator and highest towards the poles.
 * @memberof Coordinate
 * @inner
 * @param {number} startingLat The source latitude in degrees
 * @param {number} radians Distance in radians of longitude
 * @returns {number} The destination latitude in degrees
 */
function mercatorLatAddRadians(startingLat, radians) {
  const aTan = Math.tan(Math.PI / 360 * (startingLat + 90));
  const bTan = aTan * Math.pow(Math.E, radians);

  return Math.atan(bTan) * 360 / Math.PI - 90;
}

/**
 * This class represents a point on a sphere defined by latitude and longitude.
 * Latitude is a degree number in the range [-90, 90].
 * Longitude is a degree number without limits but is normalized to [-180, 180).
 */
class Coordinate {
  /**
   * Constructor takes either 1 or 2 arguments.
   * 2 arguments: latitude and longitude.
   * 1 argument: an object with at least one [latitude alias]{@link Coordinate~LATITUDE_ALIASES} and one one [longitude alias]{@link Coordinate~LONGITUDE_ALIASES}.
   * @param {number|Object} latitudeOrObject
   * @param {number} [longitude] Optional only if the first argument is a Coordinate-like object
   */
  constructor(latitudeOrObject, longitude) {
    let latitude = latitudeOrObject;

    if (typeof latitudeOrObject == 'object') {
      latitude = findValue(latitudeOrObject, LATITUDE_ALIASES);
      longitude = findValue(latitudeOrObject, LONGITUDE_ALIASES);

      latitude = typeof latitude == 'function' ? latitude() : latitude;
      longitude = typeof longitude == 'function' ? longitude() : longitude;
    }

    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Degrees latitude in the range [-90, 90].
   * If setting a value outside this range, it will be set to -90 or 90, whichever is closer.
   * @type {number}
   */
  get latitude() {
    return this._lat;
  }

  /**
   * Degrees longitude in the range [-Infinity, Infinity].
   * @type {number}
   */
  get longitude() {
    return this._lon;
  }

  /**
   * Degrees longitude in the range [-180, 180).
   * If the coordinate's longitude is outside this range, the equivalent value within it is used.
   * Examples: 123 => 123, 270 => -90, -541 => 179
   * @type {number}
   * @readonly
   */
  get normalLon() {
    return ((this._lon + 180) % 360 + 360) % 360 - 180;
  }

  set latitude(newLat) {
    this._lat = Math.max(-90, Math.min(forceNumber(newLat), 90));
  }

  set longitude(newLon) {
    this._lon = forceNumber(newLon);
  }

  /**
   * Add distance to the coordinate to change its position.
   * @param {number} latDist latitude distance
   * @param {number} lonDist longitude distance
   * @param {Geo.Unit} [unit=Unit.DEGREE] The unit of latDist and lonDist
   * @param {Geo.Projection} [projection=Projection.SPHERICAL] The projection of Earth (not relevant when using a physical distance unit, e.g. Mile)
   */
  add(latDist, lonDist, unit = Unit.DEGREE, projection = Projection.SPHERICAL) {
    if (projection == Projection.MERCATOR && (unit == Unit.DEGREE || unit == Unit.RADIAN)) {
      const latDistRad = unit == Unit.DEGREE ? degreesToRadians(latDist) : latDist;
      const lonDistDeg = unit == Unit.DEGREE ? lonDist : radiansToDegrees(lonDist);

      this.latitude = mercatorLatAddRadians(this.latitude, latDistRad);
      this.longitude += lonDistDeg;
    } else {
      switch (unit) {
        case Unit.DEGREE:
          this.latitude += latDist;
          this.longitude += lonDist;
          break;
        case Unit.KILOMETER:
          this.latitude += radiansToDegrees(latDist) * EARTH_RADIUS_KILOMETERS;
          this.longitude += radiansToDegrees(lonDist) * EARTH_RADIUS_KILOMETERS * Math.cos(degreesToRadians(this.latitude));
          break;
        case Unit.MILE:
          this.latitude += radiansToDegrees(latDist) * EARTH_RADIUS_MILES;
          this.longitude += radiansToDegrees(lonDist) * EARTH_RADIUS_MILES * Math.cos(degreesToRadians(this.latitude));
          break;
        case Unit.RADIAN:
          this.latitude += radiansToDegrees(latDist);
          this.longitude += radiansToDegrees(lonDist);
          break;
      }
    }
  }

  /**
   * Calculate the distance from this coordinate to another coordinate.
   * @param {Coordinate} coordinate
   * @param {Geo.Unit} [unit=Unit.MILE] The unit of distance
   * @param {Geo.Projection} [projection=Projection.SPHERICAL] The projection of Earth (not relevant when using a physical distance unit, e.g. Mile)
   * @returns {number} Distance in the requested unit
   */
  distanceTo(coordinate, unit = Unit.MILE, projection = Projection.SPHERICAL) {
    if (projection == Projection.MERCATOR && (unit == Unit.DEGREE || unit == Unit.RADIAN)) {
      const latDist = mercatorLatDistanceInRadians(this.latitude, coordinate.latitude);
      const absoluteLonDist = Math.abs(coordinate.normalLon - this.normalLon);
      const lonDist = degreesToRadians(Math.min(absoluteLonDist, 360 - absoluteLonDist));

      const radianDist = Math.sqrt(Math.pow(latDist, 2) + Math.pow(lonDist, 2));

      switch (unit) {
        case Unit.DEGREE:
          return radiansToDegrees(radianDist);
        case Unit.RADIAN:
          return radianDist;
      }
    } else {
      const radianDist = haversineDistance(this, coordinate);

      switch (unit) {
        case Unit.DEGREE:
          return radiansToDegrees(radianDist);
        case Unit.KILOMETER:
          return radianDist * EARTH_RADIUS_KILOMETERS;
        case Unit.MILE:
          return radianDist * EARTH_RADIUS_MILES;
        case Unit.RADIAN:
          return radianDist;
      }
    }
  }

  /**
   * Test if this coordinate has the same latitude and longitude as another.
   * @param {Coordinate} coordinate
   * @returns {boolean}
   */
  equals(coordinate) {
    return coordinate && coordinate.latitude === this.latitude && coordinate.longitude === this.longitude;
  }

  /**
   * Get the coordinate as a string that can be used in a search query.
   * Example: {latitude: -45, longitude: 123} => '-45,123'
   * @returns {string}
   */
  searchQueryString() {
    return `${this.latitude},${this.longitude}`;
  }
}

export {
  Coordinate
};
