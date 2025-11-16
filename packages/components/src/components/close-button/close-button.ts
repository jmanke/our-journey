import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import styles from "./close-button.css?inline";

@customElement("journey-close-button")
export class CloseButton extends LitElement {
  static styles = [unsafeCSS(styles)];

  //#region Rendering

  render(): TemplateResult {
    return html`<div></div>`;
  }

  //#endregion
}
