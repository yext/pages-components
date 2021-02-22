import { Coordinate } from '@yext/components-geo';
import { UserLocationInfoSource, UserLocationInfoType } from './constants.js';

class UserLocationInfoCache {
  static checkCoordinate(coordinate) {
    if (coordinate !== null && coordinate !== undefined && !(coordinate instanceof Coordinate)) {
      throw new Error(`expected coordinate to be an instance of Coordinate or null`);
    }
  }

  static checkSource(sourceType) {
    if(sourceType !== null && sourceType !== undefined && Object.values(UserLocationInfoSource).indexOf(sourceType) === -1) {
      throw new Error(`expected sourceType to be in ${Object.keys(UserLocationInfoSource).join(', ')}`);
    }
  }
  constructor(coordinate, sourceType) {
    this.constructor.checkCoordinate(coordinate);
    this.constructor.checkSource(sourceType);

    this._coordinate = coordinate;
    this._sourceType = sourceType;
  }

  get coordinate() {
    return this._coordinate;
  }

  set coordinate(newCoordinate) {
    this.constructor.checkCoordinate(newCoordinate);
    this._coordinate = newCoordinate;
  }

  get sourceType() {
    return this._sourceType;
  }

  set sourceType(newSource) {
    this.constructor.checkSource(newSource);
    this._sourceType = newSource;
  }

  update(coordinate, source) {
    this.coordinate = coordinate;
    this.sourceType = source;
  }

  isEmpty() {
    return !this.coordinate || !this.sourceType;
  }

  allowedForInfoType(infoType) {
    switch (this.sourceType) {
      case UserLocationInfoSource.HTML5Geo:
        return infoType === UserLocationInfoType.Any ||
          infoType === UserLocationInfoType.HTML5IfNoPrompt ||
          infoType === UserLocationInfoType.HTML5Only;
      case UserLocationInfoSource.IPAddress:
        return infoType === UserLocationInfoType.Any ||
          infoType === UserLocationInfoType.IPAddressOnly;
      default:
        throw new Error('unknown info type' + infoType);
    }
  }
}

export {
  UserLocationInfoCache
};
