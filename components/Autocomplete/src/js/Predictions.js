import { Coordinate } from '@yext/components-geo';

const PredictionType = Object.freeze({
  COUNTRY: Symbol('country prediction'),
  GEOCODE: Symbol('geo prediction'),
  POSTALCODE: Symbol('postal code prediction'),
  REGION: Symbol('region prediction')
});

class PredictionBuilder {
  withId(id) {
    this.id = id;
    return this;
  }

  withName(name) {
    this.name = name;
    return this;
  }

  withMatchedSubstrings(matchedSubStrings) {
    this.matchedSubStrings = matchedSubStrings;
    return this;
  }

  withType(predictionType) {
    if (Object.values(PredictionType).indexOf(predictionType) < 0) {
      throw new Error(`prediction type must be one of ${Object.values(PredictionType).map(a => a.toString()).join(', ')}`);
    }
    this.type = predictionType;
    return this;
  }

  withCoordinate(coordinate) {
    if (!(coordinate instanceof Coordinate)) {
      throw new Error(`${coordinate} must be instance of Coordinate`);
    }
    this.coordinate = coordinate;
    return this;
  }

  withPostalCode(code) {
    this.postalCode = code;
    return this;
  }

  withISORegionCode(code) {
    this.isoRegionCode = code;
    return this;
  }

  withISOCountryCode(code) {
    this.isoCountryCode = code;
    return this;
  }

  build() {
    if (this.coordinate || this.isoRegionCode || this.isoCountryCode || this.postalCode) {
      return new DetailedPrediction(this);
    }
    return new ShortPrediction(this);
  }
}

class ShortPrediction {
  constructor(builder) {
    this.id = builder.id;
    this.name = builder.name;
    this.type = builder.type;
    this.matchedSubStrings = builder.matchedSubStrings;
  }

  typeName() {
    switch (this.type) {
      case PredictionType.COUNTRY:
        return 'country';
      case PredictionType.POSTALCODE:
        return 'postal code'
      case PredictionType.REGION:
        return 'region';
      default:
        return 'geocode';
    }
  }
}

class DetailedPrediction extends ShortPrediction {
  constructor(builder) {
    super(builder);
    this.coordinate = builder.coordinate;
    this.isoCountryCode = builder.isoCountryCode;
    this.isoRegionCode = builder.isoRegionCode;
    this.postalCode = builder.postalCode;
  }
}

export {
  PredictionType,
  PredictionBuilder,
  ShortPrediction,
  DetailedPrediction
};
