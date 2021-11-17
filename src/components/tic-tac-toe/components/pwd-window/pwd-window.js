/**
 * The pwd-window web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */
const pathToModule = import.meta.url
const imagesPath = new URL('./img/', pathToModule)
const componentsOfParentPath = new URL('../', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    :host {
      margin: 0px;
    }
    #pwd-window {
      position: absolute;
      background-color: #333333;
      border: 2px outset #333333;
    }
    div#header {
      position: absolute;
      width: 100%;
      height: 24px;
      background-color: #333333;
    }
    div#header img {
      height: 100%;
    }
    div#header p {
      margin: 0px;
      padding-left: 4px;
      display: inline;
      user-select: none;
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      font-family: Verdana;
      font-weight: bold;
      color: white;
    }
    div#app {
      position: absolute;
      top: 24px;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    #closebutton {
      right: 0px;
    }

    #resetbutton {
      right: 26px;
    }

    button#resetbutton img {
      height: 60%;
    }

    #closebutton, #resetbutton {
      position: absolute;
      font-family: Verdana;
      font-weight: bold;
      color: white;
      width: 24px;
      height: 100%;
      background-color: #444444;
      border: 2px outset #444444;
      padding: 0px;
    }

    #closebutton:hover, #resetbutton:hover {
      background-color: #999999;
      border-color: #999999;
    }

    #closebutton:active, #resetbutton:active {
      transform: translate(1px, 1px);
      box-shadow: none;
      border-style: inset;
    }
  </style>
  <style id="pos"></style>
  <style id="size"></style>
  <style id="z-index"></style>
  <div id="pwd-window">
    <div id="header">
      <img>
      <p id="headertitle"></p>
      <button id="resetbutton"></button>
      <button id="closebutton">X</button>
    </div>
    <div id="app"><slot name="app"></slot></div>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('pwd-window',
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
      this.header = this.shadowRoot.querySelector('div#header')
      this.icon = this.shadowRoot.querySelector('div#header img')
      this._stylePos = this.shadowRoot.querySelector('style#pos')
      this._styleSize = this.shadowRoot.querySelector('style#size')
      this._styleZIndex = this.shadowRoot.querySelector('style#z-index')
      this._closeButton = this.shadowRoot.querySelector('#closebutton')
      this._resetButton = this.shadowRoot.querySelector('#resetbutton')
      this._appSlot = this.shadowRoot.querySelector('slot')
      this._headerTitle = this.shadowRoot.querySelector('p#headertitle')

      this._closeButton.addEventListener('click', event => {
        this.parentElement.removeChild(this)
      })

      const resetButtonImg = document.createElement('img')
      resetButtonImg.setAttribute('src', imagesPath + 'reset.png')
      this._resetButton.appendChild(resetButtonImg)

      this._resetButton.addEventListener('click', event => {
        const currentApp = this._appSlot.lastChild.nodeName
        this.SetApp(currentApp)
      })

      this.x = 0
      this.y = 0

      this.width = 0
      this.height = 0
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
     * Sets the position of the element relative to its parent, ensuring that the x/y
     * properties and the left/top coordinates set in the CSS element are always the same.
     *
     * @param {number} x - The number to be set as the element's x position relative to its parent.
     * @param {number} y - The number to be set as the element's y position relative to its parent.
     */
    SetPosition (x, y) {
      this._stylePos.textContent =
      `#pwd-window {
        left: ` + x + `px;
        top: ` + y + `px;
      }`

      this.x = x
      this.y = y
    }

    /**
     * Sets the z-index of the element, ensuring that the zIndex property and
     * the z-index rule set in the CSS element are always the same.
     *
     * @param {number} z - The number to be assigned to the element's z index.
     */
    SetZIndex (z) {
      this._styleZIndex.textContent =
      `#pwd-window {
        z-index: ` + z + `;
      }`

      this.zIndex = z
    }

    /**
     * Sets the size of the window and its contained app, ensuring that the width/height
     * properties and the width/height set in the CSS element are always the same.
     *
     * @param {number} width - The app's width in pixels.
     * @param {number} height - The app's height in pixels.
     */
    SetSize (width, height) {
      this.width = width
      this.height = height + 24
      this._styleSize.textContent =
      `#pwd-window {
        width: ` + width + `px;
        height: ` + (height + 24) + `px;
      }
      div#app {
        width: ` + width + `px;
        height: ` + height + `px;
      }`
    }

    /**
     * Sets the pwd-app to be displayed as content in the window.
     *
     * @param {HTMLElement} app - The app to be displayed.
     */
    SetApp (app) {
      if (this._appSlot.lastChild !== null) {
        this._appSlot.removeChild(this._appSlot.lastChild)
      }
      const newAppElement = document.createElement(app)
      this._appSlot.appendChild(newAppElement)
      this.icon.setAttribute('src', componentsOfParentPath + '/' + app + '/img/icon.png')
      this._headerTitle.textContent = newAppElement.name
      this.SetSize(newAppElement.width, newAppElement.height)
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
