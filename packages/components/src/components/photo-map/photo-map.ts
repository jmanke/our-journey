import {
  LitElement,
  html,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Map, Marker } from "maplibre-gl";
import styles from "./photo-map.css?inline";

import mapLibreStyles from "maplibre-gl/dist/maplibre-gl.css?inline";

export interface Photo {
  src: string;
  thumbnailSrc: string;
  longLat: [number, number];
}

/**
 * Represents a photo marker on the map.
 */
export interface PhotoMarker {
  /**
   * The source URL of the photo.
   */
  src: string;
  /**
   * The thumbnail source URL of the photo.
   */
  thumbnailSrc: string;
  /**
   * The map marker.
   */
  marker: Marker;
  /**
   * The HTML element representing the marker.
   */
  element: HTMLDivElement;
  /**
   * The image element within the marker.
   */
  imgElement: HTMLImageElement;
  /**
   * The count indicator element for overlapping markers.
   */
  countIndicator: HTMLDivElement;
  /**
   * Photo markers that are hidden by this marker due to overlap.
   */
  hiddenPhotoMarkers: PhotoMarker[];
}

@customElement("journey-photo-map")
export class PhotoMap extends LitElement {
  static styles = [unsafeCSS(styles), unsafeCSS(mapLibreStyles)];

  //#region Properties

  @property() sources?: Photo[];

  //#endregion

  //#region State

  @state() map?: Map;

  @state() selectedPhotoMarkers?: PhotoMarker[];

  @state() selectedPhotoMarker?: PhotoMarker;

  //#endregion

  mapRef?: HTMLElement;
  photoMarkers: PhotoMarker[] = [];

  //#region Private methods

  async createImgMarker(
    source: Photo,
    markerSize: number,
    markerIndicatorSize: number
  ): Promise<PhotoMarker> {
    if (!this.map) {
      throw new Error("Map is not initialized");
    }

    // create marker element
    const element = document.createElement("div");
    const countIndicator = document.createElement("div");
    countIndicator.classList.add("count-indicator");
    element.appendChild(countIndicator);
    const img = document.createElement("img");
    img.width = markerSize;
    img.height = markerSize;
    element.appendChild(img);

    const marker = new Marker({
      element: element,
      anchor: "bottom",
      offset: [0, -markerIndicatorSize],
    })
      .setLngLat(source.longLat)
      .setOpacity("0")
      .addTo(this.map);
    marker.addClassName("photo-marker");

    const photoMarker: PhotoMarker = {
      src: source.src,
      thumbnailSrc: source.thumbnailSrc,
      marker,
      element: element,
      imgElement: img,
      countIndicator,
      hiddenPhotoMarkers: [],
    };
    element.addEventListener("click", () => {
      if (!photoMarker.hiddenPhotoMarkers.length) {
        this.selectedPhotoMarker = photoMarker;
        return;
      }

      this.selectedPhotoMarkers = [
        photoMarker,
        ...photoMarker.hiddenPhotoMarkers,
      ];
    });

    return photoMarker;
  }

  visiblePhotoMarkers(): PhotoMarker[] {
    if (!this.map) {
      return [];
    }

    const mapRect = this.mapRef?.getBoundingClientRect();
    if (!mapRect) {
      return [];
    }

    const visibleImages: PhotoMarker[] = [];
    this.photoMarkers.forEach((marker) => {
      const rect = marker.element.getBoundingClientRect();
      // if any part of the rect is within the map rect, it's visible
      if (
        rect.right >= mapRect.left &&
        rect.left <= mapRect.right &&
        rect.bottom >= mapRect.top &&
        rect.top <= mapRect.bottom
      ) {
        visibleImages.push(marker);
      }
    });

    return visibleImages;
  }

  /**
   * Ensures that no photo markers overlap each other on the map by hiding overlapping markers.
   */
  hideOverlappingMarkers(): void {
    let photoMarkers = this.visiblePhotoMarkers();

    while (photoMarkers.length) {
      const photoMarker = photoMarkers.shift();
      if (!photoMarker) {
        break;
      }

      photoMarker.marker.setOpacity("1");
      photoMarker.marker.addClassName("visible");
      photoMarker.imgElement.src = photoMarker.thumbnailSrc;
      const markerRect = photoMarker.element.getBoundingClientRect();
      photoMarker.hiddenPhotoMarkers = [];

      const remainingPhotoMarkers: PhotoMarker[] = [];
      for (const otherPhotoMarker of photoMarkers) {
        const otherElement = otherPhotoMarker.element;
        const otherRect = otherElement.getBoundingClientRect();
        if (
          markerRect.right >= otherRect.left &&
          markerRect.left <= otherRect.right &&
          markerRect.bottom >= otherRect.top &&
          markerRect.top <= otherRect.bottom
        ) {
          otherPhotoMarker.marker.setOpacity("0");
          otherPhotoMarker.marker.removeClassName("visible");
          photoMarker.hiddenPhotoMarkers.push(otherPhotoMarker);
        } else {
          remainingPhotoMarkers.push(otherPhotoMarker);
        }
      }

      const photoCount = photoMarkers.length - remainingPhotoMarkers.length + 1;
      photoMarker.countIndicator.textContent =
        photoCount > 1 ? photoCount.toLocaleString() : null;

      photoMarkers = remainingPhotoMarkers;
    }
  }

  private async updatePhotoMarkers(): Promise<void> {
    if (!this.sources || !this.map) {
      return;
    }

    const computedStyle = getComputedStyle(this);
    const markerSize = parseInt(
      computedStyle.getPropertyValue("--journey-map-marker-size")
    );
    const markerIndicatorSize = parseInt(
      computedStyle.getPropertyValue("--journey-map-marker-indicator-size")
    );

    // TODO: use cloudinary
    this.photoMarkers = (
      await Promise.allSettled(
        this.sources.map((source) =>
          this.createImgMarker(source, markerSize, markerIndicatorSize)
        )
      )
    )
      .filter((promise) => promise.status === "fulfilled")
      .map((promise) => promise.value);

    this.hideOverlappingMarkers();
  }

  //#endregion

  //#region Lifecycle

  protected willUpdate(_changedProperties: PropertyValues<this>): void {
    if (_changedProperties.has("sources") || _changedProperties.has("map")) {
      this.updatePhotoMarkers();
    }
  }

  async firstUpdated(): Promise<void> {
    const mapRef = this.shadowRoot?.querySelector(".map");
    if (!(mapRef instanceof HTMLElement)) {
      return;
    }
    this.mapRef = mapRef;

    this.map = new Map({
      container: mapRef,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      center: [-74.006, 40.7128],
      zoom: 6,
    });
    this.map.on("moveend", () => this.hideOverlappingMarkers());
  }

  //#endregion

  //#region Rendering

  render(): TemplateResult {
    return html`
      <div class="container">
        <div class="map"></div>
        <div class="content">
          <journey-photo-gallery
            ?closed=${!this.selectedPhotoMarkers?.length}
            @journey-closed=${() => (this.selectedPhotoMarkers = undefined)}
          >
            ${this.selectedPhotoMarkers?.map(
              (marker) =>
                html`<journey-photo-gallery-item
                  src="${marker.thumbnailSrc}"
                  @click=${() => (this.selectedPhotoMarker = marker)}
                />`
            )}
          </journey-photo-gallery>
        </div>
      </div>
      <journey-scrim
        ?closed=${!this.selectedPhotoMarker}
        @journey-closed=${() => (this.selectedPhotoMarker = undefined)}
      ></journey-scrim>
      ${this.selectedPhotoMarker &&
      html`<img
        class="selected-photo"
        src="${this.selectedPhotoMarker.src}"
      />`}
    `;
  }

  //#endregion
}
