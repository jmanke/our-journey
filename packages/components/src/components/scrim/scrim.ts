import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./scrim.css?inline";

@customElement("journey-scrim")
export class Scrim extends LitElement {
  static styles = [unsafeCSS(styles)];

  //#region Properties

  @property({ reflect: true }) closed?: boolean;

  //#endregion

  //#region Private methods

  private close(): void {
    this.closed = true;
    this.dispatchEvent(
      new CustomEvent("journey-closed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  //#endregion

  //#region Lifecycle

  //#endregion

  //#region Rendering

  render(): TemplateResult {
    return html`<div @click=${() => this.close()}></div>`;
  }

  //#endregion
}
