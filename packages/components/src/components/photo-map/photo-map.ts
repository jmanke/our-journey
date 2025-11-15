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
   * The source URL of the photo.
   */
  src: string;
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
  mapRef?: HTMLElement;
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
    const map = document.createElement("div");
    const countIndicator = document.createElement("div");
    countIndicator.classList.add("count-indicator");
    map.appendChild(countIndicator);
    const img = document.createElement("img");
    img.src = src;
    img.width = markerSize;
    img.height = markerSize;
    map.appendChild(img);

    const marker = new Marker({
      element: map,
      anchor: "bottom",
      offset: [0, -markerIndicatorSize],
    })
      .setLngLat([long, lat])
      .addTo(this.map);
    marker.addClassName("photo-marker");

    const photoMarker = {
      src,
      marker,
      element: map,
      countIndicator,
      hiddenPhotoMarkers: [],
    };
    map.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("journeyPhotoMarkerClick", {
          detail: { photos: [photoMarker, ...photoMarker.hiddenPhotoMarkers] },
          bubbles: true,
          composed: true,
        })
      );
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
          "IMG_3193_thumbnail.jpg",
          "IMG_3198_thumbnail.jpg",
          "IMG_3203_thumbnail.jpg",
          "IMG_3227_thumbnail.jpg",
          "IMG_3230_thumbnail.jpg",
          "IMG_3236_thumbnail.jpg",
          "IMG_3323_thumbnail.jpg",
          "IMG_3335_thumbnail.jpg",
          "IMG_3357_thumbnail.jpg",
          "IMG_3362_thumbnail.jpg",
          "IMG_3376_thumbnail.jpg",
          "IMG_3383_thumbnail.jpg",
          "IMG_3385_thumbnail.jpg",
          "IMG_3403_thumbnail.jpg",
          "IMG_3410_thumbnail.jpg",
          "IMG_3412_thumbnail.jpg",
          "IMG_3417_thumbnail.jpg",
          "IMG_3564_thumbnail.jpg",
          "IMG_3573_thumbnail.jpg",
          "IMG_3620_thumbnail.jpg",
          "IMG_3635_thumbnail.jpg",
          "IMG_3653 2_thumbnail.jpg",
          "IMG_3654_thumbnail.jpg",
          "IMG_3660_thumbnail.jpg",
          "IMG_3675 2_thumbnail.jpg",
          "IMG_3675_thumbnail.jpg",
          "IMG_3683_thumbnail.jpg",
          "IMG_3736_thumbnail.jpg",
          "IMG_3738_thumbnail.jpg",
          "IMG_3918_thumbnail.jpg",
          "IMG_3937_thumbnail.jpg",
          "IMG_3941_thumbnail.jpg",
          "IMG_3977_thumbnail.jpg",
          "IMG_4094_thumbnail.jpg",
          "IMG_4110_thumbnail.jpg",
          "IMG_4165_thumbnail.jpg",
          "IMG_4283_thumbnail.jpg",
          "IMG_4310_thumbnail.jpg",
          "IMG_4353_thumbnail.jpg",
          "IMG_4360_thumbnail.jpg",
          "IMG_4377_thumbnail.jpg",
          "IMG_4384_thumbnail.jpg",
          "IMG_4440_thumbnail.jpg",
          "IMG_4476_thumbnail.jpg",
          "IMG_4506_thumbnail.jpg",
          "IMG_4529_thumbnail.jpg",
          "IMG_4543_thumbnail.jpg",
          "IMG_4548_thumbnail.jpg",
          "IMG_4603_thumbnail.jpg",
          "IMG_4611_thumbnail.jpg",
          "IMG_4617_thumbnail.jpg",
          "IMG_4643_thumbnail.jpg",
          "IMG_4680_thumbnail.jpg",
          "IMG_4681_thumbnail.jpg",
          "IMG_4733_thumbnail.jpg",
          "IMG_4741_thumbnail.jpg",
          "IMG_4760_thumbnail.jpg",
          "IMG_4825_thumbnail.jpg",
          "IMG_4993_thumbnail.jpg",
          "IMG_5004_thumbnail.jpg",
          "IMG_5014_thumbnail.jpg",
          "IMG_5029_thumbnail.jpg",
          "IMG_5033_thumbnail.jpg",
          "IMG_5062_thumbnail.jpg",
          "IMG_5101_thumbnail.jpg",
          "IMG_5111_thumbnail.jpg",
          "IMG_5122_thumbnail.jpg",
          "IMG_5169_thumbnail.jpg",
          "IMG_5177_thumbnail.jpg",
          "IMG_5193_thumbnail.jpg",
          "IMG_5202_thumbnail.jpg",
          "IMG_5237_thumbnail.jpg",
          "IMG_5364 2_thumbnail.jpg",
          "IMG_5403_thumbnail.jpg",
          "IMG_5427_thumbnail.jpg",
          "IMG_5477_thumbnail.jpg",
          "IMG_5500_thumbnail.jpg",
          "IMG_5516_thumbnail.jpg",
          "IMG_5619_thumbnail.jpg",
          "IMG_5680_thumbnail.jpg",
          "IMG_5750_thumbnail.jpg",
          "IMG_5751 2_thumbnail.jpg",
          "IMG_5760_thumbnail.jpg",
          "IMG_5768 2_thumbnail.jpg",
          "IMG_5972_thumbnail.jpg",
          "IMG_6025_thumbnail.jpg",
          "IMG_6028_thumbnail.jpg",
          "IMG_6040_thumbnail.jpg",
          "IMG_6128_thumbnail.jpg",
          "IMG_6155_thumbnail.jpg",
          "IMG_6157_thumbnail.jpg",
          "IMG_6175_thumbnail.jpg",
          "IMG_6220_thumbnail.jpg",
          "IMG_6251_thumbnail.jpg",
          "IMG_6253 2_thumbnail.jpg",
          "IMG_6259_thumbnail.jpg",
          "IMG_6292_thumbnail.jpg",
          "IMG_6317_thumbnail.jpg",
          "IMG_6332_thumbnail.jpg",
          "IMG_6349_thumbnail.jpg",
          "IMG_6356_thumbnail.jpg",
          "IMG_6442_thumbnail.jpg",
          "IMG_6512_thumbnail.jpg",
          "IMG_6655_thumbnail.jpg",
          "IMG_6664_thumbnail.jpg",
          "IMG_6674_thumbnail.jpg",
          "IMG_6703_thumbnail.jpg",
          "IMG_6709_thumbnail.jpg",
          "IMG_6720_thumbnail.jpg",
          "IMG_6725_thumbnail.jpg",
          "IMG_6729_thumbnail.jpg",
          "IMG_6756_thumbnail.jpg",
          "IMG_6758_thumbnail.jpg",
          "IMG_6798_thumbnail.jpg",
          "IMG_6804_thumbnail.jpg",
          "IMG_6805_thumbnail.jpg",
          "IMG_6807 2_thumbnail.jpg",
          "IMG_6824_thumbnail.jpg",
          "IMG_6828_thumbnail.jpg",
          "IMG_6829_thumbnail.jpg",
          "IMG_6883_thumbnail.jpg",
          "IMG_6962_thumbnail.jpg",
          "IMG_7019_thumbnail.jpg",
          "IMG_7042_thumbnail.jpg",
          "IMG_7046_thumbnail.jpg",
          "IMG_7150_thumbnail.jpg",
          "IMG_7169_thumbnail.jpg",
          "IMG_7185_thumbnail.jpg",
          "IMG_7212_thumbnail.jpg",
          "IMG_7300_thumbnail.jpg",
          "IMG_7399_thumbnail.jpg",
          "IMG_7406_thumbnail.jpg",
          "IMG_7452_thumbnail.jpg",
          "IMG_7468_thumbnail.jpg",
          "IMG_7479_thumbnail.jpg",
          "IMG_7552_thumbnail.jpg",
          "IMG_7567_thumbnail.jpg",
        ].map((src) =>
          this.createImgMarker(
            `thumbnails/${src}`,
            markerSize,
            markerIndicatorSize
          )
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
    return html` <div class="container">
      <div class="map"></div>
      <div class="content">
        <slot> </slot>
      </div>
    </div>`;
  }

  //#endregion
}
