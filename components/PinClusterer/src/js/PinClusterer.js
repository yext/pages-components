import { Unit, Projection } from '@yext/components-geo';
import { GeoBounds } from '@yext/components-geo';
import { PinOptions } from '@yext/components-maps';
import { PinProperties } from '@yext/components-maps';
import { Type, assertType, assertInstance } from '@yext/components-util';
import { common__modules__Pin_cluster, common__modules__Pin_clusterHovered } from 'templates/common/modules/MapPin.soy';

/**
 * Represents a cluster of {@link MapPin}s on a map.
 * @member {MapPin} clusterPin
 * @member {MapPin[]} pins
 * @see {PinCluster}
 */
class PinCluster {
  /**
   * @param {MapPin} clusterPin
   * @param {MapPin[]} pins
   */
  constructor(clusterPin, pins) {
    this.clusterPin = clusterPin;
    this.pins = [...pins];
  }
}

/**
 * {@link PinClusterer} options class
 */
class PinClustererOptions {
  /**
   * Initialize with default options
   */
  constructor() {
    this.autoUpdate = true;
    this.clickHandler = cluster => {};
    this.clusterRadius = 50;
    this.clusterZoomAnimated = true;
    this.clusterZoomMax = Infinity;
    this.hideOffscreen = false;
    this.hoverHandler = (cluster, hovered) => {};
    this.iconTemplates = {
      'default': common__modules__Pin_cluster,
      'hovered': common__modules__Pin_clusterHovered
    };
    this.minClusterSize = 2;
    this.propertiesForStatus = status => new PinProperties()
      .setAnchorX(0.5)
      .setAnchorY(0.5)
      .setHeight(33)
      .setIcon(status.hovered || status.focused ? 'hovered' : 'default')
      .setWidth(33);
    this.updateHandler = clusters => {};
    this.zoomOnClick = true;
  }

  /**
   * @param {boolean} autoUpdate Whether the clusters automatically update when the map zoom changes
   * @returns {PinClustererOptions}
   */
  withAutoUpdate(autoUpdate) {
    this.autoUpdate = autoUpdate;
    return this;
  }

  /**
   * @typedef PinClusterer~clickHandler
   * @function
   * @param {PinCluster} cluster The cluster whose pin was clicked
   */

  /**
   * @param {PinClusterer~clickHandler} clickHandler Function that runs when a pin cluster is clicked
   * @returns {PinClustererOptions}
   */
  withClickHandler(clickHandler) {
    assertType(clickHandler, Type.FUNCTION);

    this.clickHandler = clickHandler;
    return this;
  }

  /**
   * @param {number} clusterRadius The max pixel distance from the center of a cluster to any pin in the cluster
   * @returns {PinClustererOptions}
   */
  withClusterRadius(clusterRadius) {
    this.clusterRadius = clusterRadius;
    return this;
  }

  /**
   * @param {boolean} clusterZoomAnimated Whether to animate map zoom on cluster click
   * @returns {PinClustererOptions}
   */
  withClusterZoomAnimated(clusterZoomAnimated) {
    this.clusterZoomAnimated = clusterZoomAnimated;
    return this;
  }

  /**
   * @param {number} clusterZoomMax Max zoom level for the map after clickimg a cluster
   * @returns {PinClustererOptions}
   */
  withClusterZoomMax(clusterZoomMax) {
    this.clusterZoomMax = clusterZoomMax;
    return this;
  }

  /**
   * @param {boolean} hideOffscreen If true, a cluster pin will only be rendered if it's in the visible portion of the map to improve performance
   * @returns {PinClustererOptions}
   */
  withHideOffscreen(hideOffscreen) {
    this.hideOffscreen = hideOffscreen;
    return this;
  }

  /**
   * @typedef PinClusterer~hoverHandler
   * @function
   * @param {PinCluster} cluster The cluster whose pin was hovered
   * @param {boolean} hovered Whether the cluster pin is currently hovered
   */

  /**
   * @param {PinClusterer~hoverHandler} hoverHandler Function that runs when a pin cluster is hovered
   * @returns {PinClustererOptions}
   */
  withHoverHandler(hoverHandler) {
    assertType(hoverHandler, Type.FUNCTION);

    this.hoverHandler = hoverHandler;
    return this;
  }

  /**
   * @typedef PinClusterer~iconTemplate
   * @function
   * @param {Object} data
   * @param {Object} data.pinCount The number of pins in the cluster
   * @returns {string} The URL or data URI of the icon image
   */

  /**
   * @param {string} key The unique name for the icon, used in {@link PinProperties#getIcon} and {@link PinProperties#setIcon}
   * @param {PinClusterer~iconTemplate} iconTemplate A template function that returns the pin icon for a cluster
   * @returns {PinClustererOptions}
   */
  withIconTemplate(key, iconTemplate) {
    assertType(iconTemplate, Type.FUNCTION);

    this.iconTemplates[key] = iconTemplate;
    return this;
  }

  /**
   * @param {number} minClusterSize The minimum number of pins in a cluster
   * @returns {PinClustererOptions}
   */
  withMinClusterSize(minClusterSize) {
    this.minClusterSize = minClusterSize;
    return this;
  }

  /**
   * @param {MapPin~propertiesForStatus} propertiesForStatus The propertiesForStatus function for the cluster pins
   * @returns {PinClustererOptions}
   */
  withPropertiesForStatus(propertiesForStatus) {
    assertType(propertiesForStatus, Type.FUNCTION);

    this.propertiesForStatus = propertiesForStatus;
    return this;
  }

  /**
   * @typedef PinClusterer~updateHandler
   * @function
   * @param {PinCluster[]} clusters All pin clusters after the update
   */

  /**
   * @param {PinClusterer~updateHandler} updateHandler Function that runs after the clusters are updated
   * @returns {PinClustererOptions}
   */
  withUpdateHandler(updateHandler) {
    assertType(updateHandler, Type.FUNCTION);

    this.updateHandler = updateHandler;
    return this;
  }

  /**
   * @param {boolean} zoomOnClick Whether to zoom in to the pins in a cluster on cluster click
   * @returns {PinClustererOptions}
   */
  withZoomOnClick(zoomOnClick) {
    this.zoomOnClick = zoomOnClick;
    return this;
  }

  /**
   * @returns {PinClusterer}
   */
  build() {
    return new PinClusterer(this);
  }
}

/**
 * Cluster {@link MapPin}s on a {@link Map} for any provider. PinClusterer can automatically update
 * clusters as needed when the map changes. Clicking on a cluster expands it and fits the map to
 * the pins. Clustering behavior can be customized by changing the radius and minimum pin count.
 */
class PinClusterer {
  /**
   * @param {PinClustererOptions} options
   */
  constructor(options) {
    assertInstance(options, PinClustererOptions);

    this._autoUpdate = options.autoUpdate;
    this._clickHandler = options.clickHandler;
    this._clusterRadius = options.clusterRadius;
    this._clusterZoomAnimated = options.clusterZoomAnimated;
    this._clusterZoomMax = options.clusterZoomMax;
    this._hideOffscreen = options.hideOffscreen;
    this._hoverHandler = options.hoverHandler;
    this._iconTemplates = options.iconTemplates;
    this._minClusterSize = options.minClusterSize;
    this._propertiesForStatus = options.propertiesForStatus;
    this._updateHandler = options.updateHandler;
    this._zoomOnClick = options.zoomOnClick;

    this._clusters = [];
    this.reset(false);
  }

  /**
   * @param {MapPin[]} pins The pins to be clustered. Any other pins on the map will be ignored.
   * @param {?Map} map The {@link Map} to cluster the pins on. If not specified, it will be the map that all the pins are currently on. If not all pins are on the same map, this function will throw an error.
   * @param {Geo.Projection} [mapProjection=Projection.MERCATOR] The projection of the map that the pins will be clustered on
   */
  cluster(pins, map = null, mapProjection = Projection.MERCATOR) {
    this.reset();

    if (!pins.length) {
      return;
    }

    if (!map) {
      // If no map was provided, infer the map from the pins.
      map = pins[0].getMap();

      // All pins must be on the same map.
      if (pins.find(pin => pin.getMap() !== map)) {
        throw new Error('Error: All pins must be on the same map');
      }

      // If map is null for all pins, the pins are all not on any map.
      if (!map) {
        throw new Error('Error: Pins are not on a map');
      }
    }

    this._map = map;
    this._mapProjection = mapProjection;
    this._pins = pins;

    this.update(true);

    if (this._autoUpdate) {
      const autoUpdater = async () => {
        // Wait for the map to move, then stop moving
        await map.moving();
        await map.idle();

        // Make sure that the auto-updater didn't get reset while waiting
        if (this._autoUpdater == autoUpdater) {
          this.update();
          autoUpdater();
        }
      };

      this._autoUpdater = autoUpdater;
      autoUpdater();
    }
  }

  /**
   * @returns {PinCluster[]} Current pin clusters
   */
  getClusters() {
    return [...this._clusters];
  }

  /**
   * @param {boolean} [restorePins=true] Whether to put pins currently in clusters back on the map
   */
  reset(restorePins = true) {
    if (restorePins) {
      this._pins.forEach(pin => pin.setMap(this._map));
    }

    this._autoUpdater = null;
    this._currentZoom = null;
    this._map = null;
    this._mapProjection = null;
    this._pins = [];

    this.update(true);
  }

  /**
   * @param {boolean} [force=false] If true, bypass checks that skip the update if deemed not necessary (e.g. if the zoom hasn't changed)
   */
  update(force = false) {
    if (!force && this._map && this._map.getZoom() == this._currentZoom) {
      return;
    }

    this._clusters.forEach(cluster => cluster.clusterPin.remove());
    this._clusters = [];

    if (!this._map || !this._pins.length) {
      return;
    }

    for (const pinCluster of this._generateClusters(this._pins)) {
      if (pinCluster.length < this._minClusterSize) {
        pinCluster.forEach(pin => pin.setMap(this._map));
      } else {
        const coordinates = pinCluster.map(pin => pin.getCoordinate());
        const pinOptions = this._map.newPinOptions()
          .withCoordinate(GeoBounds.fit(coordinates).getCenter(this._mapProjection))
          .withHideOffscreen(this._hideOffscreen)
          .withPropertiesForStatus(this._propertiesForStatus);

        // Build cluster icon(s) from template
        for (const [icon, template] of Object.entries(this._iconTemplates)) {
          pinOptions.withIcon(icon, template({ pinCount: pinCluster.length }));
        }

        const clusterPin = pinOptions.build();
        const newCluster = new PinCluster(clusterPin, pinCluster);

        // Remove all pins in cluster from map, replace with cluster pin
        pinCluster.forEach(pin => pin.remove());
        clusterPin.setMap(this._map);
        this._clusters.push(newCluster);

        // When clicked, fit map to all the pins in the cluster and update clusters
        clusterPin.setFocusHandler(focused => {
          clusterPin.setStatus({ focused });
          this._hoverHandler(newCluster, focused);
        });
        clusterPin.setHoverHandler(hovered => {
          clusterPin.setStatus({ hovered });
          this._hoverHandler(newCluster, hovered);
        });
        clusterPin.setClickHandler(async () => {
          if (this._zoomOnClick) {
            const movingPromise = this._map.moving();

            this._map.fitCoordinates(coordinates, this._clusterZoomAnimated, this._clusterZoomMax);
            await movingPromise;
            await this._map.idle();
            this.update();
          }

          this._clickHandler(newCluster);
        });
      }
    }

    // Save the zoom level of the clusters -- they don't have to be updated if zoom doesn't change
    this._currentZoom = this._map.getZoom();

    this._updateHandler(this.getClusters());
  }

  /**
   * Generate clusters of pins based on the options set by the {@PinClustererOptions} for this instance.
   * The input is a set (array) of {@link MapPin}s and the output is a set (array) of groups of
   * the pins such that:
   *
   * - Each pin is in exactly one cluster
   * - Each pin is at most {@link PinClustererOptions~withClusterRadius|clusterRadius} pixels from the center of the cluster, as determined by the map projection and zoom level
   * - Each cluster has at least one pin
   *
   * @protected
   * @param {MapPin[]} pins
   * @returns {MapPin[][]} An array of clusters (arrays) of pins. All pins are in exactly one cluster.
   */
  _generateClusters(pins) {
    const clusterRadiusRadians = this._clusterRadius * Math.PI / 2 ** (this._map.getZoom() + 7);
    const pinsInRadius = pins.map((pin, index) => [index]);
    const pinClusters = [];

    // Calculate the distances of each pin to each other pin
    pins.forEach((pin, index) => {
      for (let otherIndex = index; otherIndex < pins.length; otherIndex++) {
        if (otherIndex != index) {
          const distance = pin.getCoordinate().distanceTo(pins[otherIndex].getCoordinate(), Unit.RADIAN, this._mapProjection);

          if (distance <= clusterRadiusRadians) {
            pinsInRadius[index].push(otherIndex);
            pinsInRadius[otherIndex].push(index);
          }
        }
      }
    });

    // Loop until there are no pins left to cluster
    while (true) {
      let maxCount = 0;
      let chosenIndex;

      // Find the pin with the most other pins within radius
      pinsInRadius.forEach((pinGroup, index) => {
        if (pinGroup.length > maxCount) {
          maxCount = pinGroup.length;
          chosenIndex = index;
        }
      });

      // If there are no more pins within clustering radius of another pin, break
      if (!maxCount) {
        break;
      }

      // Add pins to a new cluster, and remove them from pinsInRadius
      const chosenPins = pinsInRadius[chosenIndex];
      const cluster = [];

      pinsInRadius[chosenIndex] = [];

      for (const index of chosenPins) {
        const pinGroup = pinsInRadius[index];

        // Add the pin to this cluster and remove it from consideration for other clusters
        cluster.push(pins[index]);
        pinsInRadius[index] = [];
        pinGroup.forEach(otherIndex => pinsInRadius[otherIndex].splice(pinsInRadius[otherIndex].indexOf(index), 1));
      }

      pinClusters.push(cluster);
    }

    return pinClusters;
  }
}

export {
  PinCluster,
  PinClustererOptions,
  PinClusterer
};
