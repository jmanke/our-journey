import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Map, Marker } from "maplibre-gl";
import styles from "./photo-map.css?inline";

import mapLibreStyles from "maplibre-gl/dist/maplibre-gl.css?inline";
import { readLongLatFromJpg } from "../../utils/image-utils";

/**
 * Represents a photo marker on the map.
 */
interface PhotoMarker {
  /**
   * The map marker.
   */
  marker: Marker;
  /**
   * The HTML element representing the marker.
   */
  element: HTMLDivElement;
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

  map?: Map;
  mapContainer?: HTMLElement;
  photoMarkers: PhotoMarker[] = [];

  //#region Private methods

  async createImgMarker(
    src: string,
    markerSize: number,
    markerIndicatorSize: number
  ): Promise<PhotoMarker> {
    if (!this.map) {
      throw new Error("Map is not initialized");
    }

    const response = await fetch(src);
    const blob = await response.blob();
    const [long, lat] = await readLongLatFromJpg(blob);

    // create marker element
    const container = document.createElement("div");
    const countIndicator = document.createElement("div");
    countIndicator.classList.add("count-indicator");
    container.appendChild(countIndicator);
    const img = document.createElement("img");
    img.src = src;
    img.width = markerSize;
    img.height = markerSize;
    container.appendChild(img);

    const marker = new Marker({
      element: container,
      anchor: "bottom",
      offset: [0, -markerIndicatorSize],
    })
      .setLngLat([long, lat])
      .addTo(this.map);
    marker.addClassName("photo-marker");

    const photoMarker = {
      marker,
      element: container,
      countIndicator,
      hiddenPhotoMarkers: [],
    };
    container.addEventListener("click", () => {
      console.log("Marker clicked", photoMarker);
    });

    return photoMarker;
  }

  visiblePhotoMarkers(): PhotoMarker[] {
    if (!this.map) {
      return [];
    }

    const mapRect = this.mapContainer?.getBoundingClientRect();
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

  //#endregion

  //#region Lifecycle

  async firstUpdated(): Promise<void> {
    const mapContainer = this.shadowRoot?.querySelector(".container");
    if (!(mapContainer instanceof HTMLElement)) {
      return;
    }
    this.mapContainer = mapContainer;

    this.map = new Map({
      container: mapContainer,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      center: [-74.006, 40.7128],
      zoom: 6,
    });
    this.map.on("moveend", () => this.hideOverlappingMarkers());

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
        [
          "thumbnails/IMG_4285_thumbnail.jpg",
          "thumbnails/IMG_4296_thumbnail.JPG",
          "thumbnails/IMG_4506_thumbnail.jpg",
          "thumbnails/IMG_4733_thumbnail.jpg",
          "thumbnails/IMG_5084_thumbnail.jpg",
          "thumbnails/test_thumbnail.jpg",
        ].map((src) =>
          this.createImgMarker(`/${src}`, markerSize, markerIndicatorSize)
        )
      )
    )
      .filter((promise) => promise.status === "fulfilled")
      .map((promise) => promise.value);

    this.hideOverlappingMarkers();
  }

  //#endregion

  //#region Rendering

  render(): TemplateResult {
    return html`<div class="container"></div>`;
  }

  //#endregion
}
