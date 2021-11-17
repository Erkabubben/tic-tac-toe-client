/**
 * The chat-nickname-state web component module.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */
const pathToModule = import.meta.url
const imagesOfParentPath = new URL('../../img/', pathToModule)

/**
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    #chat-nickname-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    form {
      margin: auto;
      font-family: Verdana;
      color: white;
      width: 50%;
    }

    form input {
      display: block;
      margin: auto;
      font-size: 1.15em;
    }

    form p {
      display: block;
      text-align: center;
    }

    form button {
      display: block;
      margin-left: auto;
      margin-right: auto;
      font-size: 1.15em;
      font-family: Verdana;
      color: white;
      font-weight: bold;
      background-color: #444444;
      border: 2px outset #444444;
    }

    form button:hover {
      background-color: #999999;
      border-color: #999999;
    }

    ::part(selected) {
      box-shadow: 0px 0px 2px 8px grey;
    }
  </style>
  <div id="chat-nickname-state">
    <form>
      <br>
      <img src="` + imagesOfParentPath + `icon.png">
      <p>Enter a nickname:</p>
      <input type="text" id="nickname" class="selectable" autocomplete="off">
      <br><br>
      <div id="alternatives"></div><br>
      <button type="button">Start!</button> 
    </form>
  </div>
`

/**
 * Define custom element.
 */
customElements.define('chat-nickname-state',
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

      /* Nickname screen properties */
      this._chatNicknameState = this.shadowRoot.querySelector('#chat-nickname-state')
      this._button = this.shadowRoot.querySelector('button')
      this._input = this.shadowRoot.querySelector('input')
      this._alternatives = this.shadowRoot.querySelector('#alternatives')

      /* Event listeners for determining when a nickname has been submitted */
      this._input.addEventListener('keydown', (event) => {
        if (event.keyCode === 13) { // Checks if the Enter button has been pressed
          event.preventDefault()
          if (this._input.value.length > 2) {
            this.dispatchEvent(new window.CustomEvent('nicknameSet', { detail: this._input.value }))
          }
        }
      })
      this._button.addEventListener('click', () => { // Checks if the mouse has been clicked
        if (this._input.value.length > 2) {
          this.dispatchEvent(new window.CustomEvent('nicknameSet', { detail: this._input.value }))
        }
      })

      /* Event Listener that will set focus to the previously selected element when
        clicking inside the state */
      this.addEventListener('click', () => {
        this._input.focus()
      })
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return ['nickname']
    }

    /**
     * Creates a style tag from a given parameter tag and appends it to the shadow DOM.
     * Intended for inheriting CSS styles from a parent element.
     *
     * @param {HTMLElement} styleElement - The style tag to be inherited.
     */
    InheritStyle (styleElement) {
      const style = document.createElement('style')
      style.id = 'inherited'
      style.textContent = styleElement.textContent
      this.shadowRoot.appendChild(style)
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      this._input.focus() // Sets the text input to have focus from the start
    }

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      /* Sets the previous nickname as the default value when returning from the memory */
      if (name === 'nickname') {
        this._input.setAttribute('value', this.getAttribute('nickname'))
      }
    }

    /**
     * Called after the element has been removed from the DOM.
     */
    disconnectedCallback () {
      document.removeEventListener('keydown', this.keyDownFunction)
      document.removeEventListener('keyup', this.keyUpFunction)
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
