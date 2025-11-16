import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./panel.css?inline";

@customElement("journey-panel")
export class Panel extends LitElement {
  static styles = [unsafeCSS(styles)];

  //#region Properties

  @property({ reflect: true, type: Boolean }) closed = false;

  //#endregion

  //#region State

  //#endregion

  //#region Private methods

  closePanel(): void {
    this.closed = true;
    this.dispatchEvent(
      new CustomEvent("journey-panel-closed", {
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
    return html`<div class="panel">
      <journey-close-button
        @click=${() => this.closePanel()}
      ></journey-close-button>
      <slot></slot>
    </div>`;
  }

  //#endregion
}
