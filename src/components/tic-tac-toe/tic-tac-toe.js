/**
 * The tic-tac-toe web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */

const pathToModule = import.meta.url
const imagesPath = new URL('./img/', pathToModule)
const componentsPath = new URL('./components/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')

/* The application uses style inheritance, so any CSS rules defined
   below will be passed to the sub-components. */
template.innerHTML = `
  <style>
    #main {
      background-image: url("` + imagesPath + `mosaic.jpg");
      position: relative;
      display: block;
      overflow: hidden;
    }
    h1, h2 {
      font-family: Verdana;
      text-align: center;
      color: black;
      margin: 16px;
      user-select: none;
    }
    #memory-question, #nickname-state, #memory-message, #memory-highscore {
      border-radius: 32px;
      background-color: #3399FF;
      border: 16px outset #336699;
      padding: 16px;
      width: min-width(480px);
      height: min-content;
    }

    div#alternatives {
      text-align: left;
    }
    button {
      background-color: rgba(0, 0, 0, 0);
      border: 6px outset #333333;
      font-family: Verdana;
      font-size: 1.25em;
      padding: 0.25em;
      margin: 12px;
      box-shadow: 1px 1px 1px black;
    }
    button:active {
      border: 6px outset #333333;
      transform: translate(1px, 1px);
      box-shadow: 0px 0px 0px black;
    }
    button:hover {
      background-color: #999999;
      border-color: #999999;
    }
    #pwd-application {
      position: relative;
    }
    #pwd-window-container {
      position: relative;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    #pwd-dock {
      height: 48px;
      width: 100%;
      background-color: #333333;
      background-opacity: 50%;
      position: absolute;
      bottom: 0%;
      overflow: hidden;
      z-index: 10000
    }
    #pwd-dock button {
      height: 100%;
      margin: 0px;
      padding: 0;
      box-shadow: none;
      background-color: none;
      border: 0px outset #333333;
    }
    #pwd-dock button img {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }
    #pwd-dock button#resetbutton {
      position: absolute;
      right: 6px;
      font-family: Verdana;
      font-size: 75%;
      color: white;
      background-color: #444444;
      border: 2px outset #333333;
      padding: 8px;
      margin: auto;
      height: 75%;
      top: 50%;
      transform: translate(0, -50%);
      border-radius: 6px;
    }

    #clock {
      position: absolute;
      top: 50%;
      right: 48px;
      transform: translate(0, -50%);
      text-align: center;
      width: 48px;
      font-family: Verdana;
      font-size: 75%;
      color: white;
      background-color: #444444;
      border: 2px outset #333333;
      border-radius: 6px;
      padding: 8px;
      margin: auto;
      user-select: none;
    }

    #pwd-dock #resetbutton:hover {
      background-color: #999999;
      border-color: #999999;
    }
  </style>
  <style id="size"></style>
  <div id="main">
  </div>
`

/**
 * Define custom element.
 */
customElements.define('tic-tac-toe',
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

      this._styleSize = this.shadowRoot.querySelector('style#size')
      this._currentState = null
      this.width = 0
      this.height = 0
      this.SetSize(1280, 800)
    }

    /**
     * Sets the size of the application, ensuring that the width/height
     * properties and the width/height set in the CSS element are always the same.
     *
     * @param {number} width - The application's width in pixels.
     * @param {number} height - The application's height in pixels.
     */
    SetSize (width, height) {
      this.width = width
      this.height = height
      this._styleSize.textContent =
      `#main {
        width: ` + width + `px;
        height: ` + height + `px;
      }`
    }

    /**
     * Allows for a HTML element to be dragged by the mouse, within the boundaries of
     * the parent element. Modified version of code found at:
     * https://www.w3schools.com/howto/howto_js_draggable.asp.
     *
     * @param {HTMLElement} elmnt - The element that should have drag functionality.
     */
    dragElement (elmnt) {
      let mouseDiffX = 0
      let mouseDiffY = 0
      const applicationWidth = this.width
      const applicationHeight = this.height

      if (elmnt.header != null) {
        // If present, the header is where you move the DIV from:
        elmnt.header.onmousedown = dragMouseDown
      } else {
        // Otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown
      }

      /**
       * Called when initiating the drag motion by clicking the element.
       * Sets up Event Listeners for the elementDrag and closeDragElement functions.
       *
       * @param {event} e - The 'mousedown' event.
       */
      function dragMouseDown (e) {
        e = e || window.event
        e.preventDefault()
        // Get the mouse cursor position at startup:
        mouseDiffX = e.clientX - elmnt.x
        mouseDiffY = e.clientY - elmnt.y
        document.onmouseup = closeDragElement
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag
      }

      /**
       * Called whenever the mouse is moved while the element is set to being dragged.
       * The element will change position in relation to the mouse pointer, but will
       * not be moved outside the boundaries of its parent.
       *
       * @param {event} e - The 'mousemove' event.
       */
      function elementDrag (e) {
        e = e || window.event
        e.preventDefault()
        // Adjust to parent boundaries
        let x = e.clientX - mouseDiffX
        let y = e.clientY - mouseDiffY
        if (x + elmnt.width >= applicationWidth) {
          x = applicationWidth - elmnt.width
        }
        if (x < 0) {
          x = 0
        }
        if (y + elmnt.height >= applicationHeight) {
          y = applicationHeight - elmnt.height
        }
        if (y < 0) {
          y = 0
        }
        // Set the element's new position:
        elmnt.SetPosition(x, y)
      }

      /**
       * Removes the registered Event Listeners when the mouse button is released.
       */
      function closeDragElement () {
        // Stop moving when mouse button is released:
        document.onmouseup = null
        document.onmousemove = null
      }
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return ['size']
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {}

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'size') {
        const xy = newValue.split(',')
        this.SetSize(xy[0], xy[1])
      }
    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {
      /* Clears any remaining event listeners when element is removed from DOM */
      clearInterval(this._clockUpdateInterval)
    }

    /**
     * Run the specified instance property
     * through the class setter.
     *
     * @param {string} prop - The property's name.
     */
    _upgradeProperty (prop) {
      if (Object.hasOwnProperty.call(this, prop)) {
        const value = this[prop]
        delete this[prop]
        this[prop] = value
      }
    }
  }
)
