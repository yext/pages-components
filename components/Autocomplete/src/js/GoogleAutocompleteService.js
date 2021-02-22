import { AutocompleteService } from './AutocompleteService.js';
import { PredictionBuilder, PredictionType } from './Predictions.js';
import { Coordinate } from '@yext/components-geo';

const GooglePlaceTypeToPredictionType = {
  'administrative_area_level_1': PredictionType.REGION,
  'country': PredictionType.COUNTRY,
  'geocode': PredictionType.GEOCODE,
  'postal_code': PredictionType.POSTALCODE
};

const allowedCodes = {
  'US': true,
  'CA': true,
};

function searchByRegionAllowedIn(countryCode) {
  return allowedCodes[countryCode] || false;
}

class GoogleAutocompleteService extends AutocompleteService {
  constructor(options) {
    super(options);
    this.predictionOptions = {};
    this.types = options.types;
    this.radius = options.radius;
    this.boundingBox = options.boundingBox;
    this.strictBounds = options.strictBounds;
    this.locale = options.locale;

    //Restrict prediction query to these countries if passed in
    this.predictionOptions.componentRestrictions = this.componentRestrictions();

    //Constrain predictions to this radius if passed in
    this.predictionOptions.radius = this.radius || null;

    //Constrain predictions to bounding box if passed in
    this.predictionOptions.bounds = this.boundingBox || null;

    //Constrain types of autocomplete results returned if passed in. I.E restrict to geocode or establishment
    //https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
    this.predictionOptions.types = this.types || null;

    this.googleAutoCompleteService = new google.maps.places.AutocompleteService();
    this.googlePlacesService = new google.maps.places.PlacesService(this.attrEl);

    // do this here bc of race condition with google library not being available
    this.userLocationInfo.getUserLocation()
      .then((userLocation) => {
        this.predictionOptions.location = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
      })
      .catch(err => console.log(err));

    // subscribing to updates so we get a better bias if the use the "use my location" button.
    this.userLocationInfo.subscribeToUpdates((userLocation) => {
      this.predictionOptions.location = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
    });
  }

  componentRestrictions() {
    if (this.countryForLocale && this.countryForLocale[this.locale] && this.countryForLocale[this.locale].length > 0) {
      if (this.countryForLocale[this.locale].length > 5) {
        console.warn(`too many country restrictions, max is 5: [${this.countryForLocale[this.locale].join(', ')}]`);
      }
      return {
        country: this.countryForLocale[this.locale].slice(0,5)
      };
    }

    if (this.countryRestrictions && this.countryRestrictions.length > 0) {
      if (this.countryRestrictions.length > 5) {
        console.warn(`too many country restrictions, max is 5: [${this.countryRestrictions.join(', ')}]`);
      }
      return {
        country:this.countryRestrictions.slice(0,5)
      };
    }
    return null;
  }

  getPredictions(query) {
    return new Promise((resolve, reject) => {
      this.predictionOptions.input = query;
      this.googleAutoCompleteService.getPlacePredictions(this.predictionOptions,(predictions, status) => {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          reject(status);
          return;
        }
        this.predictions = predictions;
        resolve(this.getshortPredictions(predictions));
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

      this.googlePlacesService.getDetails({
          fields: [
            'address_component', 'type', 'name', 'geometry'
          ],
          placeId: currentPrediction.place_id
        },
        (place, status) => {
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            reject(status);
            return;
          }

          const predictionType = this.googleTypeToPredictionType(currentPrediction.types);
          const resultBuilder = new PredictionBuilder()
            .withName(currentPrediction.description)
            .withId(currentPrediction.id)
            .withType(predictionType);

          function geocodeFallback() {
            resultBuilder.withType(PredictionType.GEOCODE);
            resultBuilder.withCoordinate(
              new Coordinate(
                place.geometry.location.lat(),
                place.geometry.location.lng()
              )
            );
          }

          if (predictionType === PredictionType.COUNTRY && place.address_components?.length) {
            resultBuilder.withISOCountryCode(place.address_components[0].short_name);
          } else if (predictionType === PredictionType.REGION && !this.disableRegionSearch && (place.address_components || []).length > 1) {
            const regionCode = place.address_components[0].short_name,
              countryCode = place.address_components[1].short_name;
            // only some regions actually work with Google Autocomplete, fallback to geocode
            if (searchByRegionAllowedIn(countryCode)) {
              resultBuilder.withISORegionCode(regionCode);
              resultBuilder.withISOCountryCode(countryCode);
            } else {
              geocodeFallback();
            }
          } else if (predictionType === PredictionType.POSTALCODE && !this.disablePostalSearch) {
            const countryComponent = (place.address_components || [])
              .find(component => component.types?.[0] === 'country');

            if (countryComponent && countryComponent.short_name) {
              resultBuilder.withPostalCode(place.address_components[0].short_name);
              resultBuilder.withISOCountryCode(countryComponent.short_name);
            } else {
              geocodeFallback();
            }
          } else {
            geocodeFallback();
          }

          resolve(resultBuilder.build());
        });
    });
  }

  googleTypeToPredictionType(googleTypesArray) {
    let type = GooglePlaceTypeToPredictionType[googleTypesArray[0]] || PredictionType.GEOCODE;
    return type;
  }

  getshortPredictions(predictionsObjArr) {
    return predictionsObjArr.map((predictionsObj) => {
      return new PredictionBuilder()
        .withName(predictionsObj.description)
        .withId(predictionsObj.id)
        .withType(this.googleTypeToPredictionType(predictionsObj.types))
        .withMatchedSubstrings(predictionsObj.matched_substrings)
        .build();
    });
  }
}

export {
  GoogleAutocompleteService
};
