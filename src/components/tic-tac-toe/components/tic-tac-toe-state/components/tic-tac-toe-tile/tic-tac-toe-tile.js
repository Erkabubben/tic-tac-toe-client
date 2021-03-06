/**
 * The tic-tac-toe-tile web component module.
 *
 * @author Erik Lindholm <eriklindholm87@hotmail.com>
 * @version 1.0.0
 */
const pathToModule = import.meta.url
const imagesPath = new URL('./images/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    :host {
      margin: 10px;
      display: inline-block;
    }
    div {
      background-color: none;
      border-radius: 16px;
      transition: box-shadow 0.5s;
      position: relative;
      overflow: hidden;
    }

    div.hidden, div.inactive.hidden {      
      border-style: dashed;
      border-color: grey;
      opacity: 0.5;
      user-select: none;
    }

    div.inactive {
      border-style: dotted;
      border-color: grey;
    }

    div.hidden img, div.hidden ::slotted(img) {
      display: none;
      user-select: none;
    }

    img, ::slotted(img) {
      max-width: 100%;
      max-height: 100%;
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      user-select: none;
    }
    img.hidden {
      display: none;
    }
    tic-tac-toe-tile::part(show) {
      display: block;
    }
    tic-tac-toe-tile::part(hide) {
      display: none;
    }
    :focus {
      box-shadow: 0px 0px 0px 4px red;
      outline: none;
    }
    /* Animation code */
    @keyframes appear {
      from {
        opacity: 0.0;
        height: 50%;
        width: 50%;
      }
      to {
        opacity: 1.0;
        height: 100%;
        width: 100%;
      }
    }
    /* Element to apply animation to */
    .appearing-symbol {
      animation-name: appear;
      animation-duration: 0.25s;
    }
    /* Animation code */
    @keyframes winner {
      from {
        height: 100%;
        width: 100%;
      }
      to {
        height: 70%;
        width: 70%;
      }
    }
    /* Element to apply animation to */
    .winner-symbol {
      animation-name: winner;
      animation-iteration-count: 10;
      animation-duration: 0.25s;
      animation-direction: alternate;
    }
  </style>
  <style id="backsideStyle">
    div.backsideUp {
      background-color: yellow;
    }
  </style>
  <div tabindex="-1" id="content">
    <img id="x">
    <img id="o">
  </div>
  <style id="size">
    div {
      width: 128px;
      height: 128px;
    }
  </style>
  `

/**
 * Define custom element.
 */
customElements.define('tic-tac-toe-tile',
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

      this._div = this.shadowRoot.querySelector('div')
      this._xImg = this._div.querySelector('img#x')
      this._oImg = this._div.querySelector('img#o')
      this.currentSymbolImg = null

      this.imgVariant = this.GetRandomInteger(0, 3)
      this._xImg.setAttribute('src', imagesPath + 'x' + this.imgVariant + '.png')
      this._oImg.setAttribute('src', imagesPath + 'o' + this.imgVariant + '.png')

      this._styleSize = this.shadowRoot.querySelector('style#size')
      this.width = 0
      this.height = 0

      this.column = 0
      this.row = 0
      this.tileID = 0

      this.updateImageSrcAttribute()
    }

    /**
     * Sets the tile to be both hidden and deactivated.
     */
    HideAndDeactivate () {
      this._div.classList.add('inactive')
      this._div.classList.add('hidden')
    }

    /**
     * Sets the size of the tile, ensuring that the width/height properties and
     * the width/height set in the CSS element are always the same.
     *
     * @param {number} width - The width in pixels.
     * @param {number} height - The height in pixels.
     */
    SetSize (width, height) {
      this.width = width
      this.height = height
      this._styleSize.textContent = `div {
        width: ` + this.width + `px;
        height: ` + this.height + `px;
      }`
    }

    /**
     * Watches the listed attributes for changes on the element.
     *
     * @returns {string[]} observedAttributes array
     */
    static get observedAttributes () {
      return ['state']
    }

    /**
     * Called by the browser engine when an attribute changes.
     *
     * @param {string} name of the attribute.
     * @param {any} oldValue the old attribute value.
     * @param {any} newValue the new attribute value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      this.updateImageSrcAttribute()
    }

    /**
     * Starts the tile's winner animation.
     */
    startWinnerAnimation () {
      this.currentSymbolImg.classList.remove('appearing-symbol')
      this.currentSymbolImg.classList.add('winner-symbol')
    }

    /**
     * Utility function for getting a random integer within a specified range.
     *
     * @param {number} min - The minimum number returned (inclusive).
     * @param {number} max - The maximum number returned (exclusive).
     * @returns {number} - A random number between the min and max values.
     */
    GetRandomInteger (min, max) {
      return Math.floor(Math.random() * (max - min)) + min
    }

    /**
     * Updates the tile to show either the X or O symbyl or neither.
     */
    updateImageSrcAttribute () {
      if (this.getAttribute('state') === 'x') {
        this._oImg.classList.add('hidden')
        this._xImg.classList.remove('hidden')
        this.currentSymbolImg = this._xImg
        // Trigger appear animation.
        this.currentSymbolImg.classList.add('appearing-symbol')
      } else if (this.getAttribute('state') === 'o') {
        this._xImg.classList.add('hidden')
        this._oImg.classList.remove('hidden')
        this.currentSymbolImg = this._oImg
        // Trigger appear animation.
        this.currentSymbolImg.classList.add('appearing-symbol')
      } else {
        this._oImg.classList.add('hidden')
        this._xImg.classList.add('hidden')
      }
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {}

    /**
     * Sets the state attribute and updates the tile.
     *
     * @param {string} newState - Value to set the tile's 'state' attribute to.
     */
    setState (newState) {
      this.setAttribute('state', newState)
      this.updateImageSrcAttribute()
    }
  })
