import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./photo-gallery-item.css?inline";

@customElement("journey-photo-gallery-item")
export class PhotoGalleryItem extends LitElement {
  static styles = [unsafeCSS(styles)];

  //#region Properties

  @property() src?: string;

  //#endregion

  //#region Private methods

  //#endregion

  //#region Lifecycle

  //#endregion

  //#region Rendering

  render(): TemplateResult {
    return html`<img src="${this.src}" alt="" width="100" height="100" />`;
  }

  //#endregion
}
