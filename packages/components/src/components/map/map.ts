import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { Map, Marker } from "maplibre-gl";
import styles from "./map.css?inline";

import mapLibreStyles from "maplibre-gl/dist/maplibre-gl.css?inline";
import { readLongLatFromJpg } from "../../utils/image-utils";

@customElement("journey-photo-map")
export class PhotoMap extends LitElement {
  static styles = [unsafeCSS(styles), unsafeCSS(mapLibreStyles)];

  images: Marker[] = [];

  //#region Private methods

  async createImgMarker(
    src: string,
    map: Map,
    markerSize: number,
    markerIndicatorSize: number
  ): Promise<Marker> {
    const response = await fetch(src);
    const blob = await response.blob();
    const [long, lat] = await readLongLatFromJpg(blob);

    // create marker element
    const div = document.createElement("div");
    div.classList.add("thumbnail");
    const img = document.createElement("img");
    img.src = src;
    img.width = markerSize;
    img.height = markerSize;
    div.appendChild(img);

    const marker = new Marker({
      element: div,
      anchor: "bottom",
      offset: [0, -markerIndicatorSize],
    })
      .setLngLat([long, lat])
      .addTo(map);

    return marker;
  }

  //#endregion

  //#region Lifecycle

  async firstUpdated() {
    const container = this.shadowRoot?.querySelector(".container");
    if (!(container instanceof HTMLElement)) {
      return;
    }

    const map = new Map({
      container: container,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      center: [-74.006, 40.7128],
      zoom: 6,
    });

    const computedStyle = getComputedStyle(this);
    const markerSize = parseInt(
      computedStyle.getPropertyValue("--journey-map-marker-size")
    );
    const markerIndicatorSize = parseInt(
      computedStyle.getPropertyValue("--journey-map-marker-indicator-size")
    );

    // TODO: use cloudinary
    this.images = await Promise.all(
      [
        "thumbnails/IMG_4285_thumbnail.jpg",
        "thumbnails/IMG_4296_thumbnail.JPG",
        "thumbnails/IMG_4506_thumbnail.jpg",
        "thumbnails/IMG_4733_thumbnail.jpg",
        "thumbnails/IMG_5084_thumbnail.jpg",
        "thumbnails/test_thumbnail.jpg",
      ].map((src) => this.createImgMarker(`/${src}`, map, markerSize, markerIndicatorSize))
    );
  }

  //#endregion

  //#region Rendering

  render() {
    return html`<div class="container"></div>`;
  }

  //#endregion
}
