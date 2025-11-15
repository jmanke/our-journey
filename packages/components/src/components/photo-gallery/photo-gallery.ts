import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./photo-gallery.css?inline";

@customElement("journey-photo-gallery")
export class PhotoGallery extends LitElement {
  static styles = [unsafeCSS(styles)];

  //#region Properties

  @property({ reflect: true, type: Boolean }) closed = false;

  //#endregion

  //#region State

  //#endregion

  //#region Private methods

  //#endregion

  //#region Lifecycle

  //#endregion

  //#region Rendering

  render(): TemplateResult {
    return html`<div class="photo-gallery">
      <journey-close-button
        @click=${() => (this.closed = true)}
      ></journey-close-button>
      <div class="grid">
        <slot></slot>
      </div>
    </div>`;
  }

  //#endregion
}
