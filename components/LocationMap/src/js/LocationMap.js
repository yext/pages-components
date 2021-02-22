import { Coordinate } from '@yext/components-geo';
import { MapOptions } from '@yext/components-maps';
import { MapPinOptions } from '@yext/components-maps';
import { PinOptions } from '@yext/components-maps';
import { PinProperties } from '@yext/components-maps';
import { RunIfVisible } from '@yext/components-run-if-visible';
import { Type } from '@yext/components-util';

class LocationMap {
  constructor(locationMapWrapper, {
    mapProvider,
    mapOptions,
    pinOptions,
    pinIcon,
    pinIconHovered = pinIcon,
    runIfVisibleOpts = {}
  } = {}) {
    const mapWrapper = locationMapWrapper.querySelector('.dir-map');
    const mapDataEl = locationMapWrapper.querySelector('.js-map-data');

    if (mapWrapper && mapDataEl) {
      RunIfVisible.runIfTargetVisible(mapWrapper, async () => {
        if (mapProvider) {
          await mapProvider.load();
        }

        mapOptions = mapOptions || new MapOptions()
          .withControlEnabled(false)
          .withProvider(mapProvider);

        pinOptions = pinOptions || new MapPinOptions()
          .withProvider(mapProvider)
          .withIcon('default', pinIcon)
          .withIcon('hovered', pinIconHovered)
          .withPropertiesForStatus(status => new PinProperties()
            .setIcon(status.hovered || status.focused ? 'hovered' : 'default')
          );

        const mapData = JSON.parse(mapDataEl.innerHTML);

        this.map = mapOptions
          .withWrapper(mapWrapper)
          .build();

        if (typeof mapData.latitude == Type.NUMBER && typeof mapData.longitude == Type.NUMBER) {
          const pinCoordinate = new Coordinate(mapData);
          const pin = pinOptions
            .withCoordinate(pinCoordinate)
            .build();

          const pinLink = locationMapWrapper.querySelector('.js-pin-link');
          if (pinLink) {
            pin.setClickHandler(() => pinLink.click());
          }

          pin.setMap(this.map);
          this.map.fitCoordinates([pinCoordinate]);
        }
      }, runIfVisibleOpts);
    } else {
      console.warn('Location Map missing map wrapper and/or map data.');
    }
  }
}

export {
  LocationMap
};
