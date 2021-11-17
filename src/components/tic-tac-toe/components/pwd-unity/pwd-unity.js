/**
 * The pwd-unity web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */
import { gameInfo } from './game-info.js'
const pathToModule = import.meta.url
const gamePath = new URL('./game/index.html', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #pwd-app {
      position: absolute;
      width: 640px;
      height: 456px;
    }
  </style>
  <style id="size"></style>
  <div id="pwd-app">
    <iframe src="` + gamePath + `" style="width:800px; height:600px" frameBorder="0" tabindex="0">
  </div>
`

/**
 * Define custom element.
 */
customElements.define('pwd-unity',
  /**
   *
   */
  class extends HTMLElement {
    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      /* Set up properties */
      this._pwdChat = this.shadowRoot.querySelector('#pwd-app')
      this.name = gameInfo.name
      this._styleSize = this.shadowRoot.querySelector('style#size')
      this.width = 800
      this.height = 580

      this.SetSize(this.width, this.height)
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return []
    }

    /**
     * Sets the size of the app, ensuring that the width/height properties and
     * the width/height set in the CSS element are always the same.
     *
     * @param {number} width - The app's width in pixels.
     * @param {number} height - The app's height in pixels.
     */
    SetSize (width, height) {
      this.width = width
      this.height = height
      this._styleSize.textContent = `#pwd-app {
        width: ` + this.width + `px;
        height: ` + this.height + `px;
      }`
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {

    }

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {

    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {

    }
  }
)
