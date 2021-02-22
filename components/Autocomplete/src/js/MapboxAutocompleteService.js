import 'whatwg-fetch';
import  { AutocompleteService } from './AutocompleteService';
import { PredictionBuilder, PredictionType } from './Predictions.js';
import { Coordinate } from '@yext/components-geo';

const MapboxPlaceTypeToPredictionType = {
  'country': PredictionType.COUNTRY,
  'postcode': PredictionType.POSTALCODE,
  'region': PredictionType.REGION
};

class MapboxAutocompleteService extends AutocompleteService {
  constructor(options) {
    super(options);
    this.accessToken = options.accessToken;
    this.locale = options.locale;
    this.limit = options.limit;
    this.country = this.getCountry();
    this.proximity = options.proximity;
    this.userLocationBias = options.userLocationBias;
    this.decodeMode = options.decodeMode;
    this.types = options.types;
    this.boundingBox = options.boundingBox;

    if (this.userLocationBias) {
      this.userLocationInfo.getUserLocation()
        .then((userLocation) => {
          this.proximity = `${userLocation.longitude},${userLocation.latitude}`;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  getCountry() {
    if (this.countryForLocale && this.countryForLocale[this.locale] && this.countryForLocale[this.locale].length > 0) {
      return this.countryForLocale[this.locale].join();
    }

    if (this.countryRestrictions && this.countryRestrictions.length > 0) {
      return this.countryRestrictions.join();
    }

    return null;
  }

  getAPIQuery(query) {
    let apiQuery = `https://api.mapbox.com/geocoding/v5/${this.decodeMode}/${query}.json?access_token=${this.accessToken}`
    apiQuery += this.locale ? `&language=${this.locale}` : '';
    apiQuery += this.limit ? `&limit=${this.limit}` : '';
    apiQuery += this.country ? `&country=${this.country}` : '';
    apiQuery += this.proximity ? `&proximity=${this.proximity}` : '';
    apiQuery += this.types ? `&types=${this.types}` : '';
    apiQuery += this.boundingBox ? `&bbox=${this.boundingBox}` : '';
    return apiQuery;
  }

  getPredictions(query) {
    return new Promise((resolve, reject) => {
      let apiQuery = this.getAPIQuery(query);
      const fetchInit = {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      fetch(apiQuery, fetchInit)
        .then((response) => {
          if(!response.ok) {
            reject("Request to Mapbox API Failed");
          }

          response.json().then((body) => {
            this.predictions = body.features;
            resolve(this.getshortPredictions(this.predictions));
          })
          .catch((err) => {
            console.log("ERROR getting Body JSON from response");
            reject(err);
          })
        })
        .catch((err) => {
          console.log("ERROR Querying Mapbox API: ", err);
          reject(err);
        });
    });
  }

  getPredictionAt(index) {
    return new Promise((resolve, reject) => {
      if (!this.predictions) {
        reject('No results');
        return;
      }

      const currentPrediction = this.predictions[index];

      if (!currentPrediction) {
        reject('Index out of bounds');
        return;
      }

      const predictionType = this.mapboxTypeToPredictionType(currentPrediction.place_type);
      const resultBuilder = new PredictionBuilder()
        .withName(currentPrediction.matching_place_name || currentPrediction.place_name)
        .withId(currentPrediction.id)
        .withType(predictionType);

      function geocodeFallback() {
        resultBuilder.withType(PredictionType.GEOCODE);
        resultBuilder.withCoordinate(
          new Coordinate(
            currentPrediction.center[1],
            currentPrediction.center[0])
        );
      }

      if (predictionType === PredictionType.COUNTRY && currentPrediction.properties.short_code) {
        resultBuilder.withISOCountryCode(currentPrediction.properties.short_code.toUpperCase());
      } else if (predictionType === PredictionType.REGION && !this.disableRegionSearch && currentPrediction.properties.short_code) {
        const regionData = currentPrediction.properties.short_code.split('-');
        resultBuilder.withISOCountryCode(regionData[0].toUpperCase());
        if (regionData.length > 1) {
          resultBuilder.withISORegionCode(regionData[1].toUpperCase());
        } else {
          resultBuilder.withType(PredictionType.COUNTRY);
        }
      } else if (predictionType === PredictionType.POSTALCODE && !this.disablePostalSearch) {
        const countryContext = currentPrediction.context
          ?.find(context => context.id?.split('.')[0] === 'country');

        if (countryContext?.short_code) {
          resultBuilder.withISOCountryCode(countryContext.short_code.toUpperCase());
          resultBuilder.withPostalCode(currentPrediction.text);
        } else {
          geocodeFallback();
        }
      } else {
        geocodeFallback();
      }

      resolve(resultBuilder.build());
    });
  }

  mapboxTypeToPredictionType(mapboxTypesArray) {
    let type = MapboxPlaceTypeToPredictionType[mapboxTypesArray[0]] || PredictionType.GEOCODE;
    return type;
  }

  getshortPredictions(predictionsObjArr) {
    return predictionsObjArr.map((predictionsObj) => {
      return new PredictionBuilder()
        .withName(predictionsObj.matching_place_name || predictionsObj.place_name)
        .withId(predictionsObj.id)
        .withType(this.mapboxTypeToPredictionType(predictionsObj.place_type))
        .build();
    });
  }
}

export {
  MapboxAutocompleteService
};
