/**
 * The flipped-tile web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 2.0.0
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
      margin: 2px;
      display: inline-block;
    }
    div {
      background-color: white;
      border-radius: 8px;
      border: solid black 2px;
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
    flipping-tile::part(show) {
      display: block;
    }
    flipping-tile::part(hide) {
      display: none;
    }
    :focus {
      box-shadow: 0px 0px 0px 2px yellow;
    }
  </style>
  <style id="backsideStyle">
    div.backsideUp {
      background-color: yellow;
    }
  </style>
  <div tabindex="-1" id="content">
    <slot>
    </slot>
    <img id="backside" src="` + imagesPath + `lnu-symbol.png">
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
customElements.define('flipping-tile',
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
      this._slot = this._div.querySelector('slot')
      this._backside = this._div.querySelector('img#backside')
      this._backsideStyle = this.shadowRoot.querySelector('#backsideStyle')

      this._styleSize = this.shadowRoot.querySelector('style#size')
      this.width = 0
      this.height = 0

      this.column = 0
      this.row = 0
      this.cardID = 0
      this.motif = 0

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
      return ['flipped']
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
     * Updates the tile to show either the front or the backside.
     */
    updateImageSrcAttribute () {
      // Set tile to show backside
      if (this.hasAttribute('flipped')) {
        this._div.classList.add('backsideUp')
        this._slot.setAttribute('part', 'hide')
        this._backside.setAttribute('part', 'show')
      // Set tile to show front
      } else {
        this._div.classList.remove('backsideUp')
        this._backside.setAttribute('part', 'hide')
        this._slot.setAttribute('part', 'show')
      }
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      // Change backside color if backsideColor attribute has been set
      if (this.hasAttribute('backsideColor')) {
        this._backsideStyle.textContent = `div.backsideUp {
                                              background-color: ` + this.getAttribute('backsideColor') + `;
                                          }`
      }
      // Change backside image if backsideImage attribute has been set
      if (this.hasAttribute('backsideImage')) {
        this._backside.setAttribute('src', imagesPath + this.getAttribute('backsideImage'))
      }
    }

    /**
     * Flips the tile and dispatches a 'tileflip' event with the tile's innerHTML value.
     */
    flipTile () {
      if (this.hasAttribute('flipped')) {
        this.removeAttribute('flipped')
      } else {
        this.setAttribute('flipped', true)
      }
      let printMessage = 'Front side is now up. ' + this.shadowRoot.innerHTML
      if (this.hasAttribute('flipped')) {
        printMessage = 'Back side is now up. ' + this.shadowRoot.innerHTML
      }
      this.dispatchEvent(new window.CustomEvent('tileflip', { detail: printMessage }))
      this.updateImageSrcAttribute()
    }
  })
